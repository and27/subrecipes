import type { Recipe } from "@/domain/models";
import { BASE_UNITS, UNITS } from "@/domain/units";
import type { CatalogRepositories } from "./types";

export async function saveRecipes(
  items: Recipe[],
  repositories: CatalogRepositories
): Promise<number> {
  if (items.length === 0) return 0;

  const subRecipes = await repositories.subRecipeRepository.list();
  const subRecipeIds = new Set(subRecipes.map((item) => item.id));

  for (const recipe of items) {
    if (!recipe.name.trim()) {
      throw new Error("Nombre requerido.");
    }
    if (!Number.isFinite(recipe.pax) || recipe.pax <= 0) {
      throw new Error("PAX invalido.");
    }
    if (!Number.isFinite(recipe.yieldQty) || recipe.yieldQty <= 0) {
      throw new Error("Cantidad total invalida.");
    }
    if (!recipe.yieldUnit || !UNITS.includes(recipe.yieldUnit)) {
      throw new Error("Unidad invalida.");
    }
    if (!Number.isFinite(recipe.priceNet) || recipe.priceNet < 0) {
      throw new Error("PVN invalido.");
    }
    for (const item of recipe.items) {
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        throw new Error("Cantidad invalida.");
      }
      if (item.kind === "ingredient") {
        if (!item.ingredientId) {
          throw new Error("Falta ingrediente.");
        }
        if (!BASE_UNITS.includes(item.unit)) {
          throw new Error("Unidad invalida.");
        }
      } else if (item.kind === "subrecipe") {
        if (!item.subRecipeId) {
          throw new Error("Falta subreceta.");
        }
        if (item.unit !== "unit") {
          throw new Error("Subreceta solo puede expresarse en unit.");
        }
        if (!subRecipeIds.has(item.subRecipeId)) {
          throw new Error("Subreceta inexistente.");
        }
      }
    }
  }

  await repositories.recipeRepository.upsertMany(items);
  return items.length;
}
