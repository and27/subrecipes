export type ParseInvoiceRequestBody = {
  fileName: string;
};

export type ParseInvoiceItem = {
  raw_description: string;
  line_total: number;
  qty?: number;
  unit?: string;
  confidence?: number;
};

export type ParseInvoiceResponse = {
  items: ParseInvoiceItem[];
  confidence: number;
  low_confidence: boolean;
  warnings: string[];
};

export type ParseInvoiceErrorResponse = {
  error: string;
};

export function isParseInvoiceRequestBody(
  value: unknown
): value is ParseInvoiceRequestBody {
  if (!isRecord(value)) return false;
  return typeof value.fileName === "string" && value.fileName.trim() !== "";
}

export function isParseInvoiceResponse(
  value: unknown
): value is ParseInvoiceResponse {
  if (!isRecord(value)) return false;

  if (
    !Array.isArray(value.items) ||
    typeof value.confidence !== "number" ||
    typeof value.low_confidence !== "boolean" ||
    !Array.isArray(value.warnings)
  ) {
    return false;
  }

  if (!value.items.every(isParseInvoiceItem)) {
    return false;
  }

  if (!value.warnings.every((warning) => typeof warning === "string")) {
    return false;
  }

  return true;
}

export function parseInvoiceResponse(value: unknown): ParseInvoiceResponse {
  if (!isParseInvoiceResponse(value)) {
    throw new Error("Respuesta invalida del parseo de factura");
  }

  return value;
}

function isParseInvoiceItem(value: unknown): value is ParseInvoiceItem {
  if (!isRecord(value)) return false;

  if (
    typeof value.raw_description !== "string" ||
    typeof value.line_total !== "number"
  ) {
    return false;
  }

  if (value.qty !== undefined && typeof value.qty !== "number") {
    return false;
  }

  if (value.unit !== undefined && typeof value.unit !== "string") {
    return false;
  }

  if (value.confidence !== undefined && typeof value.confidence !== "number") {
    return false;
  }

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
