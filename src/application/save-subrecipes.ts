import type { SubRecipe } from "@/domain/models";
import type { CatalogRepositories } from "./types";

export async function saveSubRecipes(
  items: SubRecipe[],
  repositories: CatalogRepositories
): Promise<number> {
  if (items.length === 0) return 0;

  await repositories.subRecipeRepository.upsertMany(items);
  return items.length;
}
