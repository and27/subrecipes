import type { CatalogRepositories } from "./types";

export async function deleteRecipe(
  id: string,
  repositories: CatalogRepositories
): Promise<void> {
  await repositories.recipeRepository.deleteById(id);
}
