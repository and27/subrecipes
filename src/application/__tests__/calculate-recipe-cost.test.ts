import { describe, expect, it } from "vitest";

import { calculateRecipeCostById } from "@/application/calculate-recipe-cost";
import type { CatalogRepositories } from "@/application/types";
import type { Ingredient, Recipe, SubRecipe } from "@/domain/models";

const ingredients: Ingredient[] = [
  { id: "ing-a", name: "Azucar", baseUnit: "g", pricePerBaseUnit: 0.002 },
];

const subRecipes: SubRecipe[] = [
  {
    id: "sub-a",
    name: "Relleno",
    yieldQty: 1,
    yieldUnit: "unit",
    pax: 1,
    items: [{ ingredientId: "ing-a", qty: 300, unit: "g" }],
  },
];

const recipes: Recipe[] = [
  {
    id: "rec-a",
    name: "Tarta",
    pax: 6,
    items: [{ kind: "subrecipe", subRecipeId: "sub-a", qty: 1, unit: "unit" }],
  },
];

const repositories: CatalogRepositories = {
  ingredientRepository: {
    list: async () => ingredients,
    getById: async (id) => ingredients.find((item) => item.id === id),
    upsertMany: async () => undefined,
    clear: async () => undefined,
  },
  subRecipeRepository: {
    list: async () => subRecipes,
    getById: async (id) => subRecipes.find((item) => item.id === id),
    upsertMany: async () => undefined,
    deleteById: async () => undefined,
    clear: async () => undefined,
  },
  recipeRepository: {
    list: async () => recipes,
    getById: async (id) => recipes.find((item) => item.id === id),
    upsertMany: async () => undefined,
    clear: async () => undefined,
  },
  metaRepository: {
    get: async () => undefined,
    set: async () => undefined,
  },
};

describe("calculateRecipeCostById", () => {
  it("calcula costo usando repositorios", async () => {
    const result = await calculateRecipeCostById("rec-a", repositories);
    expect(result.total).toBeCloseTo(0.002 * 300, 5);
    expect(result.perPax).toBeCloseTo((0.002 * 300) / 6, 5);
  });

  it("falla si la receta no existe", async () => {
    await expect(
      calculateRecipeCostById("rec-inexistente", repositories)
    ).rejects.toThrow(/receta inexistente/);
  });
});
