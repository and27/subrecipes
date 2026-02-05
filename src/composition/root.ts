import { createDexieDb } from "@/adapters/dexie/db";
import { createDexieRepositories } from "@/adapters/dexie/repositories";
import { calculateRecipeCostById } from "@/application/calculate-recipe-cost";
import { calculateSubRecipeCostById } from "@/application/calculate-subrecipe-cost";
import { deleteSubRecipe } from "@/application/delete-subrecipe";
import { saveIngredientCatalog } from "@/application/save-ingredient-catalog";
import { saveSubRecipes } from "@/application/save-subrecipes";
import { ensureDemoSeed } from "@/application/seed-demo-data";
import { getCatalogSnapshot } from "@/application/get-catalog-snapshot";
import type { Ingredient, SubRecipe } from "@/domain/models";

const db = createDexieDb();
const repositories = createDexieRepositories(db);

export const appServices = {
  repositories,
  ensureDemoSeed: () => ensureDemoSeed(repositories),
  getCatalogSnapshot: () => getCatalogSnapshot(repositories),
  calculateSubRecipeCostById: (subRecipeId: string) =>
    calculateSubRecipeCostById(subRecipeId, repositories),
  calculateRecipeCostById: (recipeId: string) =>
    calculateRecipeCostById(recipeId, repositories),
  saveIngredientCatalog: (items: Ingredient[]) =>
    saveIngredientCatalog(items, repositories),
  saveSubRecipes: (items: SubRecipe[]) =>
    saveSubRecipes(items, repositories),
  deleteSubRecipe: (id: string) => deleteSubRecipe(id, repositories),
};
