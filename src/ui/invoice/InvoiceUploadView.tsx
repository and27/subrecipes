"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  type ParseInvoiceItem,
  parseInvoiceResponse,
  type ParseInvoiceResponse,
} from "@/domain/invoice-parse";
import type { Ingredient } from "@/domain/models";
import { toBaseQuantity, UNITS } from "@/domain/units";
import { appServices } from "@/composition/root";
import { Button } from "@/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/ui/card";
import { ParsedItemsTable } from "@/ui/invoice/ParsedItemsTable";

type DraftStatus = "sin_archivo" | "listo_para_parseo";

function formatDate(iso: string | null) {
  if (!iso) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatConfidence(value: number | undefined) {
  if (value === undefined) return "-";
  return `${Math.round(value * 100)}%`;
}

export function InvoiceUploadView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draftCreatedAt, setDraftCreatedAt] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseInvoiceResponse | null>(null);
  const [correctedItems, setCorrectedItems] = useState<ParseInvoiceItem[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<Ingredient[]>([]);
  const [ingredientSelections, setIngredientSelections] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseRequestedAt, setParseRequestedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    let active = true;

    const loadIngredients = async () => {
      const snapshot = await appServices.getCatalogSnapshot();
      if (!active) return;
      setIngredientOptions(snapshot.ingredients);
    };

    loadIngredients().catch(() => {
      if (!active) return;
      setIngredientOptions([]);
    });

    return () => {
      active = false;
    };
  }, []);

  const draftStatus: DraftStatus = selectedFile
    ? "listo_para_parseo"
    : "sin_archivo";

  const draftStatusLabel =
    draftStatus === "listo_para_parseo"
      ? "Listo para parseo"
      : "Pendiente de archivo";

  const parseStatus = useMemo(() => {
    if (isParsing) {
      return { label: "Procesando...", className: "text-info" };
    }

    if (!parseResult) {
      return { label: "Pendiente", className: "text-muted" };
    }

    if (parseResult.low_confidence) {
      return { label: "Baja confianza", className: "text-warning" };
    }

    return { label: "Parseo completado", className: "text-success" };
  }, [isParsing, parseResult]);

  const parsedItems = correctedItems;
  const rowErrors = useMemo(
    () =>
      validateItems(
        parsedItems,
        ingredientSelections,
        ingredientOptions
      ),
    [parsedItems, ingredientSelections, ingredientOptions]
  );
  const validItemsCount = parsedItems.length - Object.keys(rowErrors).length;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setSelectedFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    setDraftCreatedAt(nextFile ? new Date().toISOString() : null);
    setParseRequestedAt(null);
    setParseResult(null);
    setCorrectedItems([]);
    setIngredientSelections([]);
    setParseError(null);
    setSaveMessage(null);
    setSaveError(null);
  }

  async function handleParseDraft() {
    if (!selectedFile || isParsing) return;

    setIsParsing(true);
    setParseError(null);

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    try {
      const response = await fetch("/api/parse-invoice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string };
        throw new Error(
          errorPayload.error ?? "No se pudo procesar la factura en este momento."
        );
      }

      const data = parseInvoiceResponse(await response.json());
      setParseResult(data);
      setCorrectedItems(data.items);
      setIngredientSelections(
        data.items.map((item) =>
          suggestIngredientName(item.raw_description, ingredientOptions)
        )
      );
      setParseRequestedAt(new Date().toISOString());
      setSaveMessage(null);
      setSaveError(null);
    } catch (error) {
      setParseResult(null);
      setCorrectedItems([]);
      setIngredientSelections([]);
      setParseError(
        error instanceof Error
          ? error.message
          : "Error inesperado en el parseo de factura."
      );
    } finally {
      setIsParsing(false);
    }
  }

  function handleItemChange(index: number, nextItem: ParseInvoiceItem) {
    setCorrectedItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item
      )
    );
  }

  function handleIngredientChange(index: number, nextName: string) {
    setIngredientSelections((previous) =>
      previous.map((name, itemIndex) => (itemIndex === index ? nextName : name))
    );
  }

  const ingredientMatches = useMemo(
    () =>
      ingredientSelections.map((name) =>
        ingredientOptions.some(
          (option) => normalizeName(option.name) === normalizeName(name)
        )
      ),
    [ingredientOptions, ingredientSelections]
  );

  const canSave =
    parsedItems.length > 0 &&
    Object.keys(rowErrors).length === 0 &&
    !isSaving;

  async function handleSaveCatalog() {
    if (!canSave) return;

    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const itemsToUpsert = buildIngredientsForSave(
        parsedItems,
        ingredientSelections,
        ingredientOptions
      );

      const savedCount = await appServices.saveIngredientCatalog(itemsToUpsert);
      setSaveMessage(`Catalogo actualizado (${savedCount} ingredientes).`);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el catalogo."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Ingesta de factura</CardTitle>
          <CardDescription>
            Carga una imagen, revisa el preview y ejecuta el parseo mock.
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
            disabled={!selectedFile || isParsing}
            className="w-full sm:w-auto"
          >
            {isParsing ? "Procesando factura..." : "Ejecutar parseo mock"}
          </Button>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Borrador local</CardTitle>
          <CardDescription>
            Estado preliminar y respuesta del parseo mock.
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
            <span className="font-medium text-text">{formatDate(draftCreatedAt)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Parseo IA</span>
            <span className={`font-medium ${parseStatus.className}`}>
              {parseStatus.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Confianza global</span>
            <span className="font-medium text-text">
              {parseResult ? formatConfidence(parseResult.confidence) : "-"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Ultimo parseo</span>
            <span className="font-medium text-text">
              {formatDate(parseRequestedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <span className="text-muted">Items validos</span>
            <span className="font-medium text-text">
              {parsedItems.length > 0 ? `${validItemsCount}/${parsedItems.length}` : "-"}
            </span>
          </div>

          {parseResult?.warnings.length ? (
            <div className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              {parseResult.warnings[0]}
            </div>
          ) : null}

          <p className="text-xs text-muted">
            Nota: en V0, el resultado de IA es un borrador y requiere correccion
            manual antes de calcular costos.
          </p>
        </CardContent>
      </Card>

      <ParsedItemsTable
        items={parsedItems}
        isLoading={isParsing}
        error={parseError}
        lowConfidence={parseResult?.low_confidence ?? false}
        rowErrors={rowErrors}
        onItemChange={handleItemChange}
        ingredientOptions={ingredientOptions.map((option) => option.name)}
        ingredientSelections={ingredientSelections}
        ingredientMatches={ingredientMatches}
        onIngredientChange={handleIngredientChange}
        onSave={handleSaveCatalog}
        canSave={canSave}
        isSaving={isSaving}
        saveMessage={saveMessage}
        saveError={saveError}
      />
    </div>
  );
}

function validateItems(
  items: ParseInvoiceItem[],
  ingredientSelections: string[],
  ingredientOptions: Ingredient[]
): Record<number, string[]> {
  return items.reduce<Record<number, string[]>>((acc, item, index) => {
    const errors: string[] = [];

    if (item.raw_description.trim() === "") {
      errors.push("Descripcion vacia");
    }

    if (!Number.isFinite(item.line_total) || item.line_total <= 0) {
      errors.push("Total invalido");
    }

    if (item.qty !== undefined && (!Number.isFinite(item.qty) || item.qty <= 0)) {
      errors.push("Cantidad invalida");
    }

    if (item.qty !== undefined && (!item.unit || item.unit.trim() === "")) {
      errors.push("Falta unidad");
    }

    if (item.unit && !UNITS.includes(item.unit as (typeof UNITS)[number])) {
      errors.push("Unidad no valida");
    }

    if (item.qty !== undefined && item.unit) {
      try {
        toBaseQuantity(item.qty, item.unit as (typeof UNITS)[number]);
      } catch {
        errors.push("Conversion invalida");
      }
    }

    const ingredientName = ingredientSelections[index]?.trim();
    if (!ingredientName) {
      errors.push("Falta ingrediente");
    }

    const normalizedSelection = normalizeName(ingredientName ?? "");
    const existing = ingredientOptions.find(
      (option) => normalizeName(option.name) === normalizedSelection
    );

    if (existing && item.qty !== undefined && item.unit) {
      try {
        const { baseUnit } = toBaseQuantity(
          item.qty,
          item.unit as (typeof UNITS)[number]
        );
        if (existing.baseUnit !== baseUnit) {
          errors.push("Unidad base distinta");
        }
      } catch {
        errors.push("Conversion invalida");
      }
    }

    if (errors.length > 0) {
      acc[index] = errors;
    }

    return acc;
  }, {});
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function suggestIngredientName(raw: string, options: Ingredient[]) {
  const normalized = normalizeName(raw);
  const match = options.find((option) => normalizeName(option.name) === normalized);
  return match?.name ?? raw;
}

function buildIngredientsForSave(
  items: ParseInvoiceItem[],
  ingredientSelections: string[],
  ingredientOptions: Ingredient[]
): Ingredient[] {
  return items.map((item, index) => {
    const selection = ingredientSelections[index].trim();
    const normalized = normalizeName(selection);
    const existing = ingredientOptions.find(
      (option) => normalizeName(option.name) === normalized
    );

    if (!item.qty || !item.unit) {
      throw new Error("Faltan unidades para guardar el catalogo.");
    }

    const { baseQty, baseUnit } = toBaseQuantity(
      item.qty,
      item.unit as (typeof UNITS)[number]
    );
    const pricePerBaseUnit = item.line_total / baseQty;
    const purchaseUnitCost = item.line_total / item.qty;

    const now = new Date().toISOString();

    if (existing) {
      if (existing.baseUnit !== baseUnit) {
        throw new Error(
          `Unidad base distinta para ${existing.name}. Confirmar reemplazo.`
        );
      }

      return {
        ...existing,
        pricePerBaseUnit,
        priceUpdatedAt: now,
        purchasePriceExVat: item.line_total,
        purchaseQty: item.qty,
        purchaseUnit: item.unit,
        purchaseUnitCost,
      };
    }

    return {
      id: createId(),
      name: selection,
      baseUnit,
      pricePerBaseUnit,
      priceUpdatedAt: now,
      purchasePriceExVat: item.line_total,
      purchaseQty: item.qty,
      purchaseUnit: item.unit,
      purchaseUnitCost,
    };
  });
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ing-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
