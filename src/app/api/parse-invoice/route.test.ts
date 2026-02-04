import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/parse-invoice/route";
import type {
  ParseInvoiceErrorResponse,
  ParseInvoiceResponse,
} from "@/domain/invoice-parse";

describe("POST /api/parse-invoice", () => {
  it("devuelve items mock con confianza alta para factura clara", async () => {
    const request = new Request("http://localhost/api/parse-invoice", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ fileName: "factura-supermercado.jpg" }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as ParseInvoiceResponse;

    expect(response.status).toBe(200);
    expect(payload.low_confidence).toBe(false);
    expect(payload.confidence).toBeGreaterThan(0.8);
    expect(payload.items.length).toBeGreaterThan(0);
  });

  it("marca baja confianza cuando el nombre sugiere mala calidad", async () => {
    const request = new Request("http://localhost/api/parse-invoice", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ fileName: "ticket_blurry.png" }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as ParseInvoiceResponse;

    expect(response.status).toBe(200);
    expect(payload.low_confidence).toBe(true);
    expect(payload.warnings[0]).toMatch(/foto mas clara/i);
  });

  it("devuelve 400 cuando falta input valido", async () => {
    const request = new Request("http://localhost/api/parse-invoice", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const payload = (await response.json()) as ParseInvoiceErrorResponse;

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/entrada invalida/i);
  });
});
