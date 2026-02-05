import type { SubRecipe } from "@/domain/models";
import { BASE_UNITS, UNITS } from "@/domain/units";
import type { CatalogRepositories } from "./types";

export async function saveSubRecipes(
  items: SubRecipe[],
  repositories: CatalogRepositories
): Promise<number> {
  if (items.length === 0) return 0;

  const existingSubRecipes = await repositories.subRecipeRepository.list();
  const subRecipeIds = new Set([
    ...existingSubRecipes.map((item) => item.id),
    ...items.map((item) => item.id),
  ]);

  for (const subRecipe of items) {
    if (!Number.isFinite(subRecipe.yieldQty) || subRecipe.yieldQty <= 0) {
      throw new Error("Cantidad total invalida.");
    }
    if (!Number.isFinite(subRecipe.pax) || subRecipe.pax <= 0) {
      throw new Error("PAX invalido.");
    }
    if (!subRecipe.yieldUnit || !UNITS.includes(subRecipe.yieldUnit)) {
      throw new Error("Unidad invalida.");
    }
    for (const item of subRecipe.items) {
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        throw new Error("Cantidad invalida.");
      }
      if (!item.ingredientId) {
        throw new Error("Falta ingrediente.");
      }
      if (subRecipeIds.has(item.ingredientId)) {
        throw new Error("No se permiten subrecetas dentro de subrecetas.");
      }
      if (!BASE_UNITS.includes(item.unit)) {
        throw new Error("Unidad invalida.");
      }
    }
  }

  await repositories.subRecipeRepository.upsertMany(items);
  return items.length;
}
