import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import {
  isParseInvoiceRequestBody,
  parseInvoiceResponse,
} from "@/domain/invoice-parse";
import { getInvoiceParser } from "@/composition/invoice-parser";
import type { InvoiceParserInput } from "@/ports/invoice-parser";

async function readInputFromRequest(
  request: Request
): Promise<InvoiceParserInput | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return null;
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = file.type || "image/jpeg";
    const imageDataUrl = `data:${mime};base64,${base64}`;

    return {
      fileName: file.name || "factura.jpg",
      imageDataUrl,
    };
  }

  if (contentType.includes("application/json")) {
    const payload = await request.json();
    if (!isParseInvoiceRequestBody(payload)) {
      return null;
    }

    return { fileName: payload.fileName.trim() };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const input = await readInputFromRequest(request);
    if (!input) {
      return NextResponse.json(
        {
          error:
            "Entrada invalida. Envie multipart/form-data con file o JSON con fileName.",
        },
        { status: 400 }
      );
    }

    const parser = getInvoiceParser();
    const response = await parser.parse(input);
    return NextResponse.json(parseInvoiceResponse(response), { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de parseo." },
      { status: 400 }
    );
  }
}
