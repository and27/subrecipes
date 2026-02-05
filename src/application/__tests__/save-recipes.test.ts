import { describe, expect, it } from "vitest";

import { saveRecipes } from "@/application/save-recipes";
import type { CatalogRepositories } from "@/application/types";
import type { Recipe, SubRecipe } from "@/domain/models";

const subRecipes: SubRecipe[] = [
  {
    id: "sub-a",
    name: "Base",
    yieldQty: 1,
    yieldUnit: "g",
    pax: 1,
    items: [{ ingredientId: "ing-a", qty: 10, unit: "g" }],
  },
];

const repositories: CatalogRepositories = {
  ingredientRepository: {
    list: async () => [],
    getById: async () => undefined,
    upsertMany: async () => undefined,
    clear: async () => undefined,
  },
  subRecipeRepository: {
    list: async () => subRecipes,
    getById: async () => undefined,
    upsertMany: async () => undefined,
    deleteById: async () => undefined,
    clear: async () => undefined,
  },
  recipeRepository: {
    list: async () => [],
    getById: async () => undefined,
    upsertMany: async () => undefined,
    deleteById: async () => undefined,
    clear: async () => undefined,
  },
  metaRepository: {
    get: async () => undefined,
    set: async () => undefined,
  },
};

describe("saveRecipes", () => {
  it("bloquea subrecetas inexistentes", async () => {
    const items: Recipe[] = [
      {
        id: "rec-a",
        name: "Receta",
        yieldQty: 1,
        yieldUnit: "unit",
        pax: 2,
        priceNet: 10,
        items: [{ kind: "subrecipe", subRecipeId: "sub-x", qty: 1, unit: "unit" }],
      },
    ];

    await expect(saveRecipes(items, repositories)).rejects.toThrow(
      /Subreceta inexistente/
    );
  });
});
