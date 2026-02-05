"use client";

import { useEffect, useMemo, useState } from "react";

import type { Ingredient, Recipe, RecipeItem, SubRecipe } from "@/domain/models";
import type { Unit } from "@/domain/units";
import {
  calculateIngredientCost,
  calculateSubRecipeCost,
} from "@/domain/costing";
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
  kind: "ingredient" | "subrecipe";
  refId: string;
  qty: string;
};

type DraftRecipe = {
  id: string | null;
  name: string;
  yieldQty: string;
  yieldUnit: Unit | "";
  pax: string;
  priceNet: string;
  photoUrl: string;
  items: DraftItem[];
};

const emptyDraft: DraftRecipe = {
  id: null,
  name: "",
  yieldQty: "",
  yieldUnit: "",
  pax: "",
  priceNet: "",
  photoUrl: "",
  items: [{ kind: "ingredient", refId: "", qty: "" }],
};

const VAT_RATE = 0.15;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function RecipesListView() {
  const { loading, error, snapshot, refresh } = useCatalogData();
  const [draft, setDraft] = useState<DraftRecipe>(emptyDraft);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [costByRecipe, setCostByRecipe] = useState<
    Record<string, { total: number; perPax: number }>
  >({});

  const ingredients = snapshot?.ingredients ?? [];
  const subRecipes = snapshot?.subRecipes ?? [];
  const recipes = snapshot?.recipes ?? [];

  const ingredientsById = useMemo(
    () => new Map(ingredients.map((item) => [item.id, item])),
    [ingredients],
  );
  const subRecipesById = useMemo(
    () => new Map(subRecipes.map((item) => [item.id, item])),
    [subRecipes],
  );

  useEffect(() => {
    let active = true;

    const loadCosts = async () => {
      if (recipes.length === 0) {
        setCostByRecipe({});
        return;
      }

      const entries = await Promise.all(
        recipes.map(async (recipe) => {
          const cost = await appServices.calculateRecipeCostById(recipe.id);
          return [recipe.id, cost] as const;
        }),
      );

      if (!active) return;
      setCostByRecipe(Object.fromEntries(entries));
    };

    loadCosts().catch(() => {
      if (!active) return;
      setCostByRecipe({});
    });

    return () => {
      active = false;
    };
  }, [recipes]);

  const draftTotals = useMemo(() => {
    const items = buildDraftItems(draft, ingredientsById, subRecipesById);
    if (!items) {
      return { total: 0, perPax: 0, items: [] as ItemCost[] };
    }

    const total = items.reduce((sum, item) => sum + item.total, 0);
    const pax = Number(draft.pax);
    const perPax = Number.isFinite(pax) && pax > 0 ? total / pax : 0;

    return { total, perPax, items };
  }, [draft, ingredientsById, subRecipesById]);

  const unitCost = useMemo(() => {
    const qty = Number(draft.yieldQty);
    if (!draft.yieldUnit || !Number.isFinite(qty) || qty <= 0) return null;
    const { baseQty } = toBaseQuantity(qty, draft.yieldUnit);
    if (!Number.isFinite(baseQty) || baseQty <= 0) return null;
    return draftTotals.total / baseQty;
  }, [draft.yieldQty, draft.yieldUnit, draftTotals.total]);

  const priceNetValue = Number(draft.priceNet);
  const costPerPax = draftTotals.perPax;
  const contribution = Number.isFinite(priceNetValue)
    ? priceNetValue - costPerPax
    : 0;
  const priceGross = Number.isFinite(priceNetValue)
    ? priceNetValue * (1 + VAT_RATE)
    : 0;

  function resetDraft() {
    setDraft(emptyDraft);
    setSaveError(null);
    setSaveMessage(null);
  }

  function handleSelect(recipe: Recipe) {
    setDraft({
      id: recipe.id,
      name: recipe.name,
      yieldQty: String(recipe.yieldQty ?? ""),
      yieldUnit: recipe.yieldUnit ?? "",
      pax: String(recipe.pax ?? ""),
      priceNet: String(recipe.priceNet ?? ""),
      photoUrl: recipe.photoUrl ?? "",
      items: recipe.items.map((item) => ({
        kind: item.kind,
        refId: item.kind === "ingredient" ? item.ingredientId : item.subRecipeId,
        qty: String(item.qty),
      })),
    });
    setSaveError(null);
    setSaveMessage(null);
  }

  function handleAddItem(kind: "ingredient" | "subrecipe") {
    setDraft((prev) => ({
      ...prev,
      items: [...prev.items, { kind, refId: "", qty: "" }],
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

  async function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setDraft((prev) => ({ ...prev, photoUrl: result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaveError(null);
    setSaveMessage(null);

    const name = draft.name.trim();
    const yieldQty = Number(draft.yieldQty);
    const pax = Number(draft.pax);
    const priceNet = Number(draft.priceNet);

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
    if (!Number.isFinite(priceNet) || priceNet < 0) {
      setSaveError("PVN invalido.");
      return;
    }

    const items = buildRecipeItems(draft, ingredientsById, subRecipesById);
    if (!items || items.length === 0) {
      setSaveError("Agrega al menos un item valido.");
      return;
    }

    const recipe: Recipe = {
      id: draft.id ?? createId(),
      name,
      yieldQty,
      yieldUnit: draft.yieldUnit,
      pax,
      priceNet,
      photoUrl: draft.photoUrl || undefined,
      items,
    };

    try {
      setIsSaving(true);
      await appServices.saveRecipes([recipe]);
      await refresh();
      setSaveMessage("Receta guardada.");
      setDraft((prev) => ({ ...prev, id: recipe.id }));
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "No se pudo guardar la receta.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(recipeId: string) {
    setSaveError(null);
    setSaveMessage(null);

    try {
      setIsSaving(true);
      await appServices.deleteRecipe(recipeId);
      await refresh();
      if (draft.id === recipeId) {
        resetDraft();
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "No se pudo eliminar la receta.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <Card>
        <CardHeader>
          <CardTitle>Listado de recetas</CardTitle>
          <CardDescription>
            Recetas con costos, contribucion y PVN/PVP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted">Cargando recetas...</p>}
          {error && <p className="text-sm text-danger">{error}</p>}

          {!loading && !error && recipes.length === 0 && (
            <p className="text-sm text-muted">No hay recetas registradas.</p>
          )}

          {!loading && !error && recipes.length > 0 && (
            <ul className="space-y-3">
              {recipes.map((recipe) => {
                const cost = costByRecipe[recipe.id];
                const totalCost = cost?.total ?? 0;
                const perPax = cost?.perPax ?? 0;
                const contributionValue = recipe.priceNet - perPax;
                const priceGrossValue = recipe.priceNet * (1 + VAT_RATE);

                return (
                  <li
                    key={recipe.id}
                    className="rounded-2xl border border-border bg-surface-alt/80 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {recipe.photoUrl ? (
                          <img
                            src={recipe.photoUrl}
                            alt={`Foto de ${recipe.name}`}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl border border-border bg-surface-alt/60" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-text">{recipe.name}</p>
                          <p className="text-xs text-muted">
                            {recipe.yieldQty} {recipe.yieldUnit} • PAX {recipe.pax}
                          </p>
                          <p className="text-xs text-muted">
                            PVN: {formatCurrency(recipe.priceNet)} • PVP:{" "}
                            {formatCurrency(priceGrossValue)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelect(recipe)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(recipe.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                      <div>
                        Total materia prima: {formatCurrency(totalCost)}
                      </div>
                      <div>Costo por pax: {formatCurrency(perPax)}</div>
                      <div>
                        Contribucion: {formatCurrency(contributionValue)}
                      </div>
                      <div>
                        % costo:{" "}
                        {perPax && recipe.priceNet
                          ? formatPercent(perPax / recipe.priceNet)
                          : "-"}
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
              <CardTitle>{draft.name ? draft.name : "Nueva receta"}</CardTitle>
              <div className="mb-2 text-right text-xs font-semibold uppercase text-muted">
                Valor unitario{" "}
                {unitCost !== null ? formatCurrency(unitCost) : "-"}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={resetDraft}>
              Nueva receta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {saveError && <p className="text-sm text-danger">{saveError}</p>}
          {saveMessage && <p className="text-sm text-success">{saveMessage}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">Nombre</span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">
                PVN (precio venta neto)
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={draft.priceNet}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, priceNet: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr_0.8fr]">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs font-semibold uppercase text-muted">PAX</span>
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
              <span className="text-xs font-semibold uppercase text-muted">Unidad</span>
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

          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs font-semibold uppercase text-muted">
              Foto del plato
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full cursor-pointer rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-muted"
            />
          </label>

          {draft.photoUrl ? (
            <img
              src={draft.photoUrl}
              alt="Foto del plato"
              className="h-44 w-full rounded-2xl object-cover"
            />
          ) : null}

          <div className="rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold text-text">
              <span>Componentes</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddItem("ingredient")}
                >
                  Agregar ingrediente
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddItem("subrecipe")}
                >
                  Agregar subreceta
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {draft.items.map((item, index) => {
                const resolved = resolveDraftItem(
                  item,
                  ingredientsById,
                  subRecipesById,
                );
                const total = resolved?.total ?? 0;
                const percent =
                  draftTotals.total > 0 ? total / draftTotals.total : 0;

                return (
                  <div
                    key={`item-${index}`}
                    className="grid gap-3 px-4 py-3 md:grid-cols-[auto_auto_1.6fr_0.9fr_0.7fr_0.9fr_0.6fr]"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(index)}
                      className="h-9 w-9 p-0"
                      aria-label="Quitar item"
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
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                      {item.kind === "ingredient" ? (
                        <>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-alt/80 text-[11px]">
                            Ing
                          </span>
                          <span>Ingrediente</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-alt/80 text-[11px]">
                            Sub
                          </span>
                          <span>Subreceta</span>
                        </>
                      )}
                    </div>
                    <select
                      value={item.refId}
                      onChange={(event) =>
                        updateItem(index, { refId: event.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-surface-alt px-2 py-2 text-sm text-text"
                    >
                      <option value="">
                        {item.kind === "ingredient"
                          ? "Selecciona ingrediente"
                          : "Selecciona subreceta"}
                      </option>
                      {(item.kind === "ingredient" ? ingredients : subRecipes).map(
                        (option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ),
                      )}
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
                      {resolved?.unit ?? "-"}
                    </div>
                    <div className="flex items-center justify-end text-sm text-muted tabular-nums">
                      {resolved ? formatCurrency(total) : "-"}
                    </div>
                    <div className="flex items-center justify-end text-xs text-muted tabular-nums">
                      {resolved && percent > 0 ? formatPercent(percent) : "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-alt/60 px-4 py-3 text-sm text-muted">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>PVN (precio venta neto)</span>
              <span className="font-semibold text-text">
                {Number.isFinite(priceNetValue)
                  ? formatCurrency(priceNetValue)
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span>Total materia prima</span>
              <span className="font-semibold text-text">
                {formatCurrency(draftTotals.total)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span>Costo por pax</span>
              <span className="font-semibold text-text">
                {formatCurrency(draftTotals.perPax)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span>Contribucion (PVN - costo por pax)</span>
              <span className="font-semibold text-text">
                {formatCurrency(contribution)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span>PVP (IVA 15% incluido)</span>
              <span className="font-semibold text-text">
                {formatCurrency(priceGross)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar receta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ItemCost = {
  total: number;
  unit: string;
  kind: RecipeItem["kind"];
};

function resolveDraftItem(
  item: DraftItem,
  ingredientsById: Map<string, Ingredient>,
  subRecipesById: Map<string, SubRecipe>,
): ItemCost | null {
  const qty = Number(item.qty);
  if (!Number.isFinite(qty) || qty <= 0) return null;

  if (item.kind === "ingredient") {
    const ingredient = ingredientsById.get(item.refId);
    if (!ingredient) return null;
    return {
      kind: "ingredient",
      unit: ingredient.baseUnit,
      total: calculateIngredientCost(ingredient, qty, ingredient.baseUnit),
    };
  }

  const subRecipe = subRecipesById.get(item.refId);
  if (!subRecipe) return null;

  const total = calculateSubRecipeCost(subRecipe, ingredientsById);

  return {
    kind: "subrecipe",
    unit: "unit",
    total: total * qty,
  };
}

function buildRecipeItems(
  draft: DraftRecipe,
  ingredientsById: Map<string, Ingredient>,
  subRecipesById: Map<string, SubRecipe>,
): RecipeItem[] | null {
  const items: RecipeItem[] = [];

  for (const item of draft.items) {
    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      return null;
    }

    if (item.kind === "ingredient") {
      const ingredient = ingredientsById.get(item.refId);
      if (!ingredient) return null;
      items.push({
        kind: "ingredient",
        ingredientId: item.refId,
        qty,
        unit: ingredient.baseUnit as any,
      });
    } else {
      const subRecipe = subRecipesById.get(item.refId);
      if (!subRecipe) return null;
      items.push({
        kind: "subrecipe",
        subRecipeId: item.refId,
        qty,
        unit: "unit",
      });
    }
  }

  return items;
}

function buildDraftItems(
  draft: DraftRecipe,
  ingredientsById: Map<string, Ingredient>,
  subRecipesById: Map<string, SubRecipe>,
): ItemCost[] | null {
  return draft.items
    .map((item) =>
      resolveDraftItem(item, ingredientsById, subRecipesById),
    )
    .filter(Boolean) as ItemCost[];
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
