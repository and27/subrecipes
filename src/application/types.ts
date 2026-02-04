import type { IngredientRepository } from "@/ports/ingredient-repository";
import type { MetaRepository } from "@/ports/meta-repository";
import type { RecipeRepository } from "@/ports/recipe-repository";
import type { SubRecipeRepository } from "@/ports/subrecipe-repository";

export type CatalogRepositories = {
  ingredientRepository: IngredientRepository;
  subRecipeRepository: SubRecipeRepository;
  recipeRepository: RecipeRepository;
  metaRepository: MetaRepository;
};
