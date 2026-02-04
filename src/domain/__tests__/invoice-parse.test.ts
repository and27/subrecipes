import { describe, expect, it } from "vitest";

import {
  isParseInvoiceRequestBody,
  isParseInvoiceResponse,
  parseInvoiceResponse,
} from "@/domain/invoice-parse";

describe("invoice-parse contract", () => {
  it("valida request body con fileName", () => {
    expect(isParseInvoiceRequestBody({ fileName: "factura.jpg" })).toBe(true);
    expect(isParseInvoiceRequestBody({ fileName: "   " })).toBe(false);
    expect(isParseInvoiceRequestBody({})).toBe(false);
  });

  it("valida respuesta de parseo", () => {
    const payload = {
      items: [{ raw_description: "Harina", line_total: 1000, confidence: 0.8 }],
      confidence: 0.8,
      low_confidence: false,
      warnings: [],
    };

    expect(isParseInvoiceResponse(payload)).toBe(true);
    expect(parseInvoiceResponse(payload)).toEqual(payload);
  });

  it("rechaza payload invalido", () => {
    const invalidPayload = {
      items: [{ raw_description: "Leche", line_total: "890" }],
      confidence: 0.7,
      low_confidence: false,
      warnings: [],
    };

    expect(isParseInvoiceResponse(invalidPayload)).toBe(false);
    expect(() => parseInvoiceResponse(invalidPayload)).toThrow(/invalida/i);
  });
});
