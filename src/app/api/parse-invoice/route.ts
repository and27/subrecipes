import { NextResponse } from "next/server";
import {
  isParseInvoiceRequestBody,
  type ParseInvoiceResponse,
} from "@/domain/invoice-parse";

function buildMockResponse(fileName: string): ParseInvoiceResponse {
  const lowered = fileName.toLowerCase();
  const lowConfidence =
    lowered.includes("blurry") ||
    lowered.includes("blur") ||
    lowered.includes("ilegible") ||
    lowered.includes("oscura");

  if (lowConfidence) {
    return {
      items: [
        {
          raw_description: "Harina (lectura parcial)",
          line_total: 1450,
          confidence: 0.48,
        },
        {
          raw_description: "Leche (texto incompleto)",
          line_total: 890,
          confidence: 0.41,
        },
      ],
      confidence: 0.44,
      low_confidence: true,
      warnings: [
        "Calidad de imagen baja. Se recomienda subir una foto mas clara.",
      ],
    };
  }

  return {
    items: [
      {
        raw_description: "Harina 000 x 1kg",
        line_total: 1450,
        qty: 1,
        unit: "kg",
        confidence: 0.94,
      },
      {
        raw_description: "Azucar x 1kg",
        line_total: 1320,
        qty: 1,
        unit: "kg",
        confidence: 0.92,
      },
      {
        raw_description: "Leche entera x 1L",
        line_total: 890,
        qty: 1,
        unit: "l",
        confidence: 0.9,
      },
    ],
    confidence: 0.9,
    low_confidence: false,
    warnings: [],
  };
}

async function readFileNameFromRequest(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return null;
    }

    return file.name || "factura.jpg";
  }

  if (contentType.includes("application/json")) {
    const payload = await request.json();
    if (!isParseInvoiceRequestBody(payload)) {
      return null;
    }

    return payload.fileName.trim();
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const fileName = await readFileNameFromRequest(request);

    if (!fileName) {
      return NextResponse.json(
        {
          error:
            "Entrada invalida. Envie multipart/form-data con file o JSON con fileName.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(buildMockResponse(fileName), { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de parseo." },
      { status: 400 }
    );
  }
}
