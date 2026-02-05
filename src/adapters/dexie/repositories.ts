import type { IngredientRepository } from "@/ports/ingredient-repository";
import type { MetaRepository } from "@/ports/meta-repository";
import type { RecipeRepository } from "@/ports/recipe-repository";
import type { SubRecipeRepository } from "@/ports/subrecipe-repository";
import type { SubrecetasDexie } from "./db";

export type Repositories = {
  ingredientRepository: IngredientRepository;
  subRecipeRepository: SubRecipeRepository;
  recipeRepository: RecipeRepository;
  metaRepository: MetaRepository;
};

export function createDexieRepositories(db: SubrecetasDexie): Repositories {
  return {
    ingredientRepository: {
      async list() {
        return db.ingredients.toArray();
      },
      async getById(id) {
        return db.ingredients.get(id);
      },
      async upsertMany(items) {
        await db.ingredients.bulkPut(items);
      },
      async clear() {
        await db.ingredients.clear();
      },
    },
    subRecipeRepository: {
      async list() {
        return db.subRecipes.toArray();
      },
      async getById(id) {
        return db.subRecipes.get(id);
      },
      async upsertMany(items) {
        await db.subRecipes.bulkPut(items);
      },
      async deleteById(id) {
        await db.subRecipes.delete(id);
      },
      async clear() {
        await db.subRecipes.clear();
      },
    },
    recipeRepository: {
      async list() {
        return db.recipes.toArray();
      },
      async getById(id) {
        return db.recipes.get(id);
      },
      async upsertMany(items) {
        await db.recipes.bulkPut(items);
      },
      async deleteById(id) {
        await db.recipes.delete(id);
      },
      async clear() {
        await db.recipes.clear();
      },
    },
    metaRepository: {
      async get(key) {
        const entry = await db.meta.get(key);
        return entry?.value;
      },
      async set(entry) {
        await db.meta.put(entry);
      },
    },
  };
}
