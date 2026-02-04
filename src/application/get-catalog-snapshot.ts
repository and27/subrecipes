import type { Ingredient, Recipe, SubRecipe } from "@/domain/models";
import type { CatalogRepositories } from "./types";

export type CatalogSnapshot = {
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  recipes: Recipe[];
};

export async function getCatalogSnapshot(
  repositories: CatalogRepositories
): Promise<CatalogSnapshot> {
  const [ingredients, subRecipes, recipes] = await Promise.all([
    repositories.ingredientRepository.list(),
    repositories.subRecipeRepository.list(),
    repositories.recipeRepository.list(),
  ]);

  return { ingredients, subRecipes, recipes };
}
