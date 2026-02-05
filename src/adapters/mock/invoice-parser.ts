import type { ParseInvoiceResponse } from "@/domain/invoice-parse";
import type { InvoiceParser } from "@/ports/invoice-parser";

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
          line_total: 14.5,
          confidence: 0.48,
        },
        {
          raw_description: "Leche (texto incompleto)",
          line_total: 8.9,
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
        line_total: 14.5,
        qty: 1,
        unit: "kg",
        confidence: 0.94,
      },
      {
        raw_description: "Azucar x 1kg",
        line_total: 13.2,
        qty: 1,
        unit: "kg",
        confidence: 0.92,
      },
      {
        raw_description: "Leche entera x 1L",
        line_total: 8.9,
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

export function createMockInvoiceParser(): InvoiceParser {
  return {
    async parse(input) {
      const fileName = input.fileName?.trim() || "factura.jpg";
      return buildMockResponse(fileName);
    },
  };
}
