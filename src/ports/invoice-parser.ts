import type { ParseInvoiceResponse } from "@/domain/invoice-parse";

export type InvoiceParserInput = {
  fileName?: string;
  imageDataUrl?: string;
  imageUrl?: string;
};

export interface InvoiceParser {
  parse(input: InvoiceParserInput): Promise<ParseInvoiceResponse>;
}
