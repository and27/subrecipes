import type { CatalogRepositories } from "./types";

export async function deleteSubRecipe(
  id: string,
  repositories: CatalogRepositories
): Promise<void> {
  await repositories.subRecipeRepository.deleteById(id);
}
