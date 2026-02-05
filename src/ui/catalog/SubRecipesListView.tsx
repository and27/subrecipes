"use client";

import { useEffect, useMemo, useState } from "react";

import type { Unit } from "@/domain/units";
import type { SubRecipe } from "@/domain/models";
import { toBaseQuantity } from "@/domain/units";
import { appServices } from "@/composition/root";
import { Button } from "@/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/ui/card";
import { useCatalogData } from "@/ui/catalog/use-catalog-data";

type DraftItem = {
  ingredientId: string;
  qty: string;
};

type DraftSubRecipe = {
  id: string | null;
  name: string;
  yieldQty: string;
  yieldUnit: Unit | "";
  pax: string;
  items: DraftItem[];
};

const emptyDraft: DraftSubRecipe = {
  id: null,
  name: "",
  yieldQty: "",
  yieldUnit: "",
  pax: "",
  items: [{ ingredientId: "", qty: "" }],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function SubRecipesListView() {
  const { loading, error, snapshot, refresh } = useCatalogData();
  const [costById, setCostById] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<DraftSubRecipe>(emptyDraft);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const ingredients = snapshot?.ingredients ?? [];
  const subRecipes = snapshot?.subRecipes ?? [];

  const ingredientsById = useMemo(
    () => new Map(ingredients.map((item) => [item.id, item])),
    [ingredients],
  );

  const totalCost = useMemo(() => {
    return draft.items.reduce((sum, item) => {
      const ingredient = ingredientsById.get(item.ingredientId);
      const qty = Number(item.qty);
      if (!ingredient || !Number.isFinite(qty)) return sum;
      return sum + ingredient.pricePerBaseUnit * qty;
    }, 0);
  }, [draft.items, ingredientsById]);

  const unitCost = useMemo(() => {
    const qty = Number(draft.yieldQty);
    if (!draft.yieldUnit || !Number.isFinite(qty) || qty <= 0) return null;

    const { baseQty } = toBaseQuantity(qty, draft.yieldUnit);
    if (!Number.isFinite(baseQty) || baseQty <= 0) return null;
    return totalCost / baseQty;
  }, [draft.yieldQty, draft.yieldUnit, totalCost]);

  async function loadCosts() {
    if (subRecipes.length === 0) {
      setCostById({});
      return;
    }

    const entries = await Promise.all(
      subRecipes.map(async (subRecipe) => {
        try {
          const total = await appServices.calculateSubRecipeCostById(subRecipe.id);
          return [subRecipe.id, total] as const;
        } catch {
          return [subRecipe.id, 0] as const;
        }
      })
    );

    setCostById(Object.fromEntries(entries));
  }

  useEffect(() => {
    void loadCosts();
  }, [subRecipes]);

  function resetDraft() {
    setDraft(emptyDraft);
    setSaveError(null);
    setSaveMessage(null);
  }

  function handleSelect(subRecipe: SubRecipe) {
    setDraft({
      id: subRecipe.id,
      name: subRecipe.name,
      yieldQty: String(subRecipe.yieldQty ?? ""),
      yieldUnit: subRecipe.yieldUnit ?? "",
      pax: String(subRecipe.pax ?? ""),
      items: subRecipe.items.map((item) => ({
        ingredientId: item.ingredientId,
        qty: String(item.qty),
      })),
    });
    setSaveError(null);
    setSaveMessage(null);
  }

  function handleAddItem() {
    setDraft((prev) => ({
      ...prev,
      items: [...prev.items, { ingredientId: "", qty: "" }],
    }));
  }

  function handleRemoveItem(index: number) {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateItem(index: number, next: Partial<DraftItem>) {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...next } : item,
      ),
    }));
  }

  async function handleSave() {
    setSaveError(null);
    setSaveMessage(null);

    const name = draft.name.trim();
    const yieldQty = Number(draft.yieldQty);
    const pax = Number(draft.pax);

    if (!name) {
      setSaveError("Nombre requerido.");
      return;
    }

    if (!draft.yieldUnit) {
      setSaveError("Unidad requerida.");
      return;
    }

    if (!Number.isFinite(yieldQty) || yieldQty <= 0) {
      setSaveError("Cantidad total invalida.");
      return;
    }

    if (!Number.isFinite(pax) || pax <= 0) {
      setSaveError("PAX invalido.");
      return;
    }

    const items = draft.items
      .map((item) => {
        const ingredient = ingredientsById.get(item.ingredientId);
        const qty = Number(item.qty);
        if (!ingredient || !Number.isFinite(qty) || qty <= 0) {
          return null;
        }
        return {
          ingredientId: ingredient.id,
          qty,
          unit: ingredient.baseUnit,
        };
      })
      .filter(Boolean);

    if (items.length === 0) {
      setSaveError("Agrega al menos un ingrediente valido.");
      return;
    }

    const subRecipe: SubRecipe = {
      id: draft.id ?? createId(),
      name,
      yieldQty,
      yieldUnit: draft.yieldUnit,
      pax,
      items: items as SubRecipe["items"],
    };

    try {
      setIsSaving(true);
      await appServices.saveSubRecipes([subRecipe]);
      await refresh();
      await loadCosts();
      setSaveMessage("Subreceta guardada.");
      setDraft((prev) => ({ ...prev, id: subRecipe.id }));
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "No se pudo guardar la subreceta.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(subRecipeId: string) {
    setSaveError(null);
    setSaveMessage(null);

    try {
      setIsSaving(true);
      await appServices.deleteSubRecipe(subRecipeId);
      await refresh();
      await loadCosts();
      if (draft.id === subRecipeId) {
        resetDraft();
      }
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la subreceta.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Listado de subrecetas</CardTitle>
          <CardDescription>
            Preparaciones de nivel 1 con costo total en USD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <p className="text-sm text-muted">Cargando subrecetas...</p>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}

          {!loading && !error && subRecipes.length === 0 && (
            <p className="text-sm text-muted">No hay subrecetas registradas.</p>
          )}

          {!loading && !error && subRecipes.length > 0 && (
            <ul className="space-y-3">
              {subRecipes.map((subRecipe) => {
                const cost =
                  costById[subRecipe.id] ??
                  calculateSubRecipeCostPreview(subRecipe, ingredientsById);
                const unitCost = calculateSubRecipeUnitCostFromTotal(
                  subRecipe,
                  cost,
                );

                return (
                  <li
                    key={subRecipe.id}
                    className="rounded-2xl border border-border bg-surface-alt/80 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text">
                          {subRecipe.name}
                        </p>
                        <p className="text-xs text-muted">
                          {subRecipe.yieldQty} {subRecipe.yieldUnit} • PAX{" "}
                          {subRecipe.pax}
                        </p>
                        <p className="text-xs text-muted">
                          Costo total: {formatCurrency(cost)}
                        </p>
                        {unitCost !== null && (
                          <p className="text-xs text-muted">
                            Valor unitario: {formatCurrency(unitCost)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelect(subRecipe)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(subRecipe.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                {draft.name ? draft.name : "Nueva subreceta"}
              </CardTitle>
              <div className="mb-2 mr-0 text-right text-xs font-semibold uppercase text-muted">
                Valor unitario{" "}
                {unitCost !== null ? formatCurrency(unitCost) : "-"}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={resetDraft}>
              Nueva subreceta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {saveError && <p className="text-sm text-danger">{saveError}</p>}
          {saveMessage && <p className="text-sm text-success">{saveMessage}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">
                Nombre
              </span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text"
              />
            </label>
          </div>

          <div className="mb-6 grid gap-2 sm:grid-cols-[0.8fr_1.2fr_0.8fr]">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">
                PAX
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={draft.pax}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, pax: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">
                Cantidad total
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={draft.yieldQty}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    yieldQty: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">
                Unidad
              </span>
              <select
                value={draft.yieldUnit}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    yieldUnit: event.target.value as Unit,
                  }))
                }
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text"
              >
                <option value="">-</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="unit">unit</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold text-text">
              <span>Ingredientes</span>
              <Button size="sm" variant="outline" onClick={handleAddItem}>
                Agregar ingrediente
              </Button>
            </div>
            <div className="divide-y divide-border">
              {draft.items.map((item, index) => {
                const ingredient = ingredientsById.get(item.ingredientId);
                const qty = Number(item.qty);
                const total =
                  ingredient && Number.isFinite(qty)
                    ? ingredient.pricePerBaseUnit * qty
                    : null;

                return (
                  <div
                    key={`item-${index}`}
                    className="grid gap-3 px-4 py-3 md:grid-cols-[auto_2fr_1fr_1fr_1fr]"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(index)}
                      className="h-9 w-9 p-0"
                      aria-label="Quitar ingrediente"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </Button>
                    <select
                      value={item.ingredientId}
                      onChange={(event) =>
                        updateItem(index, { ingredientId: event.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-surface-alt px-2 py-2 text-sm text-text"
                    >
                      <option value="">Selecciona ingrediente</option>
                      {ingredients.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.qty}
                      onChange={(event) =>
                        updateItem(index, { qty: event.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-surface-alt px-2 py-2 text-sm text-text"
                      placeholder="Cantidad"
                    />
                    <div className="flex items-center justify-end text-sm text-muted tabular-nums">
                      {ingredient?.baseUnit ?? "-"}
                    </div>
                    <div className="flex items-center justify-end text-sm text-muted tabular-nums">
                      {total !== null ? formatCurrency(total) : "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-alt/60 px-4 py-3 text-sm text-muted">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Total materia prima</span>
              <span className="font-semibold text-text">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar subreceta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateSubRecipeCostPreview(
  subRecipe: SubRecipe,
  ingredientsById: Map<string, { pricePerBaseUnit: number }>,
): number {
  return subRecipe.items.reduce((sum, item) => {
    const ingredient = ingredientsById.get(item.ingredientId);
    if (!ingredient) return sum;
    return sum + ingredient.pricePerBaseUnit * item.qty;
  }, 0);
}

function calculateSubRecipeUnitCostFromTotal(
  subRecipe: SubRecipe,
  total: number,
): number | null {
  if (!Number.isFinite(subRecipe.yieldQty) || subRecipe.yieldQty <= 0) {
    return null;
  }
  const { baseQty } = toBaseQuantity(subRecipe.yieldQty, subRecipe.yieldUnit);
  if (!Number.isFinite(baseQty) || baseQty <= 0) {
    return null;
  }
  return total / baseQty;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sub-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
