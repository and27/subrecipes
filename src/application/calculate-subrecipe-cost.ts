import { calculateSubRecipeCost } from "@/domain/costing";
import type { CatalogRepositories } from "./types";

export async function calculateSubRecipeCostById(
  subRecipeId: string,
  repositories: CatalogRepositories
): Promise<number> {
  const [ingredients, subRecipes] = await Promise.all([
    repositories.ingredientRepository.list(),
    repositories.subRecipeRepository.list(),
  ]);

  const subRecipe = subRecipes.find((item) => item.id === subRecipeId);
  if (!subRecipe) {
    throw new Error("subreceta inexistente");
  }

  const ingredientsById = new Map(ingredients.map((item) => [item.id, item]));
  return calculateSubRecipeCost(subRecipe, ingredientsById);
}
