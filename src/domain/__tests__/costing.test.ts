import { describe, expect, it } from "vitest";

import {
  calculateRecipeCost,
  calculateSubRecipeCost,
} from "@/domain/costing";
import type { Ingredient, Recipe, SubRecipe } from "@/domain/models";

const ingredients: Ingredient[] = [
  { id: "ing-1", name: "Harina", baseUnit: "g", pricePerBaseUnit: 0.002 },
  { id: "ing-2", name: "Leche", baseUnit: "ml", pricePerBaseUnit: 0.001 },
  { id: "ing-3", name: "Huevos", baseUnit: "unit", pricePerBaseUnit: 25 },
];

const subRecipe: SubRecipe = {
  id: "sub-1",
  name: "Masa",
  yieldQty: 1,
  yieldUnit: "unit",
  pax: 1,
  items: [
    { ingredientId: "ing-1", qty: 500, unit: "g" },
    { ingredientId: "ing-2", qty: 200, unit: "ml" },
    { ingredientId: "ing-3", qty: 2, unit: "unit" },
  ],
};

const recipe: Recipe = {
  id: "rec-1",
  name: "Torta",
  yieldQty: 1,
  yieldUnit: "unit",
  pax: 8,
  priceNet: 10,
  items: [
    { kind: "subrecipe", subRecipeId: "sub-1", qty: 1, unit: "unit" },
    { kind: "ingredient", ingredientId: "ing-1", qty: 100, unit: "g" },
  ],
};

describe("costing", () => {
  it("calcula costo de subreceta", () => {
    const ingredientsById = new Map(ingredients.map((item) => [item.id, item]));
    const total = calculateSubRecipeCost(subRecipe, ingredientsById);
    expect(total).toBeCloseTo(0.002 * 500 + 0.001 * 200 + 25 * 2, 5);
  });

  it("calcula costo de receta y costo por porcion", () => {
    const ingredientsById = new Map(ingredients.map((item) => [item.id, item]));
    const subRecipesById = new Map([[subRecipe.id, subRecipe]]);

    const result = calculateRecipeCost(recipe, ingredientsById, subRecipesById);
    const expectedTotal =
      0.002 * 500 + 0.001 * 200 + 25 * 2 + 0.002 * 100;

    expect(result.total).toBeCloseTo(expectedTotal, 5);
    expect(result.perPax).toBeCloseTo(expectedTotal / 8, 5);
  });

  it("falla si falta un ingrediente", () => {
    const ingredientsById = new Map<string, Ingredient>();
    expect(() => calculateSubRecipeCost(subRecipe, ingredientsById)).toThrow(
      /ingrediente inexistente/
    );
  });
});
