import { describe, expect, it } from "vitest";

import { calculateSubRecipeCostById } from "@/application/calculate-subrecipe-cost";
import type { CatalogRepositories } from "@/application/types";
import type { Ingredient, SubRecipe } from "@/domain/models";

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
    list: async () => [],
    getById: async () => undefined,
    upsertMany: async () => undefined,
    clear: async () => undefined,
  },
  metaRepository: {
    get: async () => undefined,
    set: async () => undefined,
  },
};

describe("calculateSubRecipeCostById", () => {
  it("calcula costo usando repositorios", async () => {
    const result = await calculateSubRecipeCostById("sub-a", repositories);
    expect(result).toBeCloseTo(0.002 * 300, 5);
  });

  it("falla si la subreceta no existe", async () => {
    await expect(
      calculateSubRecipeCostById("sub-inexistente", repositories)
    ).rejects.toThrow(/subreceta inexistente/);
  });
});
