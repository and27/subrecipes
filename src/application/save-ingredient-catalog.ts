import type { Ingredient } from "@/domain/models";
import type { CatalogRepositories } from "./types";

export async function saveIngredientCatalog(
  items: Ingredient[],
  repositories: CatalogRepositories
): Promise<number> {
  if (items.length === 0) return 0;

  await repositories.ingredientRepository.upsertMany(items);
  return items.length;
}
