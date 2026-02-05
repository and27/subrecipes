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
          raw_description: "Pollo pechuga (lectura parcial)",
          line_total: 6.5,
          confidence: 0.48,
        },
        {
          raw_description: "Arroz (texto incompleto)",
          line_total: 2.4,
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
        raw_description: "Aceite vegetal 1L",
        line_total: 2.6,
        qty: 1,
        unit: "l",
        confidence: 0.94,
      },
      {
        raw_description: "Arroz 1kg",
        line_total: 2.4,
        qty: 1,
        unit: "kg",
        confidence: 0.92,
      },
      {
        raw_description: "Pollo pechuga 1kg",
        line_total: 6.5,
        qty: 1,
        unit: "kg",
        confidence: 0.9,
      },
      {
        raw_description: "Cebolla 1kg",
        line_total: 1.2,
        qty: 1,
        unit: "kg",
        confidence: 0.88,
      },
      {
        raw_description: "Pimiento 500g",
        line_total: 1.5,
        qty: 0.5,
        unit: "kg",
        confidence: 0.88,
      },
      {
        raw_description: "Ajo 200g",
        line_total: 1.1,
        qty: 0.2,
        unit: "kg",
        confidence: 0.86,
      },
      {
        raw_description: "Sal 1kg",
        line_total: 0.8,
        qty: 1,
        unit: "kg",
        confidence: 0.86,
      },
      {
        raw_description: "Pimienta 100g",
        line_total: 1.2,
        qty: 0.1,
        unit: "kg",
        confidence: 0.84,
      },
      {
        raw_description: "Arvejas 500g",
        line_total: 1.6,
        qty: 0.5,
        unit: "kg",
        confidence: 0.84,
      },
      {
        raw_description: "Caldo de pollo 1L",
        line_total: 1.3,
        qty: 1,
        unit: "l",
        confidence: 0.82,
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
