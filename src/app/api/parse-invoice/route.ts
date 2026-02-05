import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import {
  isParseInvoiceRequestBody,
  parseInvoiceResponse,
} from "@/domain/invoice-parse";
import { getInvoiceParser } from "@/composition/invoice-parser";
import type { InvoiceParserInput } from "@/ports/invoice-parser";
import sharp from "sharp";

export const runtime = "nodejs";

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
    const originalBuffer = Buffer.from(arrayBuffer);
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();
    const originalWidth = metadata.width ?? 0;
    const originalHeight = metadata.height ?? 0;

    const maxSize = 1200;
    const shouldResize =
      (originalWidth && originalWidth > maxSize) ||
      (originalHeight && originalHeight > maxSize);

    const processedBuffer = await (shouldResize
      ? image
          .resize({
            width: maxSize,
            height: maxSize,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer()
      : image.jpeg({ quality: 80 }).toBuffer());

    const processedMeta = await sharp(processedBuffer).metadata();
    const processedWidth = processedMeta.width ?? originalWidth;
    const processedHeight = processedMeta.height ?? originalHeight;

    const base64 = processedBuffer.toString("base64");
    const imageDataUrl = `data:image/jpeg;base64,${base64}`;

    return {
      fileName: file.name || "factura.jpg",
      imageDataUrl,
      metadata: {
        originalWidth,
        originalHeight,
        processedWidth,
        processedHeight,
        resized: shouldResize,
      },
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
    const provider = process.env.INVOICE_PARSER_PROVIDER ?? "mock";
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
    const startedAt = Date.now();
    const response = await parser.parse(input);
    const validated = parseInvoiceResponse(response);
    const latencyMs = Date.now() - startedAt;
    console.log(`[invoice-parser] provider=${provider} latency_ms=${latencyMs}`);
    return NextResponse.json(
      {
        ...validated,
        metadata: input.metadata ?? validated.metadata,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de parseo." },
      { status: 400 }
    );
  }
}
