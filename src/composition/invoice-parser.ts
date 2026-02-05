import { createMockInvoiceParser } from "@/adapters/mock/invoice-parser";
import { createOpenAIInvoiceParser } from "@/adapters/openai/invoice-parser";
import type { InvoiceParser } from "@/ports/invoice-parser";

export function getInvoiceParser(): InvoiceParser {
  const provider = process.env.INVOICE_PARSER_PROVIDER ?? "mock";

  if (provider === "mock") {
    return createMockInvoiceParser();
  }

  if (provider === "openai") {
    return createOpenAIInvoiceParser();
  }

  throw new Error(`Proveedor de parseo no soportado: ${provider}`);
}
