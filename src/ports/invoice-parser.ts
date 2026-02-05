import type { ParseInvoiceResponse } from "@/domain/invoice-parse";

export type InvoiceParserInput = {
  fileName?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  metadata?: {
    originalWidth?: number;
    originalHeight?: number;
    processedWidth?: number;
    processedHeight?: number;
    resized?: boolean;
  };
};

export interface InvoiceParser {
  parse(input: InvoiceParserInput): Promise<ParseInvoiceResponse>;
}
