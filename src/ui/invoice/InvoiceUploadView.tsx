"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/ui/card";

type DraftStatus = "sin_archivo" | "listo_para_parseo";

export function InvoiceUploadView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draftCreatedAt, setDraftCreatedAt] = useState<string | null>(null);
  const [parseMessage, setParseMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const draftStatus: DraftStatus = selectedFile
    ? "listo_para_parseo"
    : "sin_archivo";

  const draftStatusLabel =
    draftStatus === "listo_para_parseo"
      ? "Listo para parseo"
      : "Pendiente de archivo";

  const formattedCreatedAt = useMemo(() => {
    if (!draftCreatedAt) return "-";

    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(draftCreatedAt));
  }, [draftCreatedAt]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setSelectedFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    setDraftCreatedAt(nextFile ? new Date().toISOString() : null);
    setParseMessage(null);
  }

  function handleParseDraft() {
    if (!selectedFile) return;

    // Este paso conecta con el endpoint mock en el siguiente issue (#14).
    setParseMessage(
      "Borrador preparado. En el siguiente issue se conecta /api/parse-invoice."
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Ingesta de factura</CardTitle>
          <CardDescription>
            Carga una imagen, revisa el preview y prepara el borrador local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-dashed border-border p-4">
            <label
              htmlFor="invoice-file"
              className="text-sm font-medium text-text"
            >
              Imagen de factura
            </label>
            <input
              id="invoice-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 block w-full cursor-pointer rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-muted"
            />
            <p className="mt-2 text-xs text-muted">
              Formato esperado: JPG, PNG o WEBP. Maximo sugerido: 10 MB.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Preview</h3>
            {previewUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface-alt/70">
                <Image
                  src={previewUrl}
                  alt="Preview de factura cargada"
                  width={1400}
                  height={900}
                  unoptimized
                  className="h-auto max-h-[420px] w-full object-contain"
                />
              </div>
            ) : (
              <p className="rounded-2xl border border-border bg-surface-alt/60 px-4 py-8 text-sm text-muted">
                Todavia no se selecciono una imagen.
              </p>
            )}
          </div>

          <Button
            onClick={handleParseDraft}
            disabled={!selectedFile}
            className="w-full sm:w-auto"
          >
            Crear borrador de parseo
          </Button>
          {parseMessage && <p className="text-sm text-info">{parseMessage}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Borrador local</CardTitle>
          <CardDescription>
            Estado preliminar antes de llamar al parseo de factura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Estado</span>
            <span className="font-medium text-text">{draftStatusLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Archivo</span>
            <span className="max-w-[55%] truncate text-right font-medium text-text">
              {selectedFile?.name ?? "-"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Fecha de carga</span>
            <span className="font-medium text-text">{formattedCreatedAt}</span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Parseo IA</span>
            <span className="font-medium text-warning">
              Pendiente (issue #14)
            </span>
          </div>

          <p className="text-xs text-muted">
            Nota: en V0, el resultado de IA es un borrador y requiere correccion
            manual antes de calcular costos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
