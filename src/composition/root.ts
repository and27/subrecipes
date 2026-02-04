import { createDexieDb } from "@/adapters/dexie/db";
import { createDexieRepositories } from "@/adapters/dexie/repositories";
import { calculateRecipeCostById } from "@/application/calculate-recipe-cost";
import { saveIngredientCatalog } from "@/application/save-ingredient-catalog";
import { ensureDemoSeed } from "@/application/seed-demo-data";
import { getCatalogSnapshot } from "@/application/get-catalog-snapshot";
import type { Ingredient } from "@/domain/models";

const db = createDexieDb();
const repositories = createDexieRepositories(db);

export const appServices = {
  repositories,
  ensureDemoSeed: () => ensureDemoSeed(repositories),
  getCatalogSnapshot: () => getCatalogSnapshot(repositories),
  calculateRecipeCostById: (recipeId: string) =>
    calculateRecipeCostById(recipeId, repositories),
  saveIngredientCatalog: (items: Ingredient[]) =>
    saveIngredientCatalog(items, repositories),
};
