import OpenAI from "openai";
import type { ParseInvoiceResponse } from "@/domain/invoice-parse";
import type { InvoiceParser, InvoiceParserInput } from "@/ports/invoice-parser";

const DEFAULT_MODEL = "gpt-4.1-mini";

function buildSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["items", "confidence", "low_confidence", "warnings"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["raw_description", "line_total"],
          properties: {
            raw_description: { type: "string" },
            line_total: { type: "number" },
            qty: { type: "number" },
            unit: { type: "string" },
            confidence: { type: "number" },
          },
        },
      },
      confidence: { type: "number" },
      low_confidence: { type: "boolean" },
      warnings: {
        type: "array",
        items: { type: "string" },
      },
    },
  } as const;
}

function buildPrompt(fileName: string) {
  return [
    "Extrae items de la factura en JSON estricto.",
    "Devuelve una lista de items con:",
    "- raw_description (string)",
    "- line_total (number, precio sin IVA)",
    "- qty (number, opcional)",
    "- unit (string, opcional: g, kg, ml, l, unit)",
    "- confidence (number 0-1, opcional)",
    "Incluye:",
    "- confidence global (0-1)",
    "- low_confidence (boolean)",
    "- warnings (array de strings)",
    `Archivo: ${fileName}`,
  ].join("\n");
}

function parseJson(text: string): ParseInvoiceResponse {
  return JSON.parse(text) as ParseInvoiceResponse;
}

export function createOpenAIInvoiceParser(): InvoiceParser {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no configurada.");
  }

  const model = process.env.INVOICE_PARSER_MODEL ?? DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  return {
    async parse(input: InvoiceParserInput) {
      const imageUrl = input.imageDataUrl || input.imageUrl;
      if (!imageUrl) {
        throw new Error("Falta imagen para parsear factura.");
      }

      const response = await client.responses.create({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: buildPrompt(input.fileName ?? "factura") },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "low",
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "invoice_parse",
            strict: true,
            schema: buildSchema(),
          },
        },
      });

      const outputText = response.output_text;
      if (!outputText) {
        throw new Error("Respuesta vacia del proveedor.");
      }

      return parseJson(outputText);
    },
  };
}
