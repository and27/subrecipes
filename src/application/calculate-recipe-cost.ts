import { calculateRecipeCost, type RecipeCost } from "@/domain/costing";
import type { CatalogRepositories } from "./types";

export async function calculateRecipeCostById(
  recipeId: string,
  repositories: CatalogRepositories
): Promise<RecipeCost> {
  const recipe = await repositories.recipeRepository.getById(recipeId);
  if (!recipe) {
    throw new Error(`receta inexistente: ${recipeId}`);
  }

  const [ingredients, subRecipes] = await Promise.all([
    repositories.ingredientRepository.list(),
    repositories.subRecipeRepository.list(),
  ]);

  const ingredientsById = new Map(ingredients.map((item) => [item.id, item]));
  const subRecipesById = new Map(
    subRecipes.map((item) => [item.id, item])
  );

  return calculateRecipeCost(recipe, ingredientsById, subRecipesById);
}
