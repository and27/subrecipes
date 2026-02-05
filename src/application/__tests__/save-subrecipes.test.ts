import { describe, expect, it } from "vitest";

import { saveSubRecipes } from "@/application/save-subrecipes";
import type { CatalogRepositories } from "@/application/types";
import type { SubRecipe } from "@/domain/models";

const repositories: CatalogRepositories = {
  ingredientRepository: {
    list: async () => [],
    getById: async () => undefined,
    upsertMany: async () => undefined,
    clear: async () => undefined,
  },
  subRecipeRepository: {
    list: async () => [{ id: "sub-a", name: "A", yieldQty: 1, yieldUnit: "g", pax: 1, items: [] }],
    getById: async () => undefined,
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

describe("saveSubRecipes", () => {
  it("bloquea referencias a subrecetas dentro de subrecetas", async () => {
    const items: SubRecipe[] = [
      {
        id: "sub-b",
        name: "B",
        yieldQty: 1,
        yieldUnit: "g",
        pax: 1,
        items: [{ ingredientId: "sub-a", qty: 10, unit: "g" }],
      },
    ];

    await expect(saveSubRecipes(items, repositories)).rejects.toThrow(
      /No se permiten subrecetas dentro de subrecetas/
    );
  });
});
