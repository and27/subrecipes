import type { Ingredient, Recipe, RecipeItem, SubRecipe } from "./models";
import type { BaseUnit } from "./units";

export function calculateIngredientCost(
  ingredient: Ingredient,
  qty: number,
  unit: BaseUnit
): number {
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("qty debe ser un numero positivo");
  }
  if (ingredient.baseUnit !== unit) {
    throw new Error(
      `unidad incompatible: ${ingredient.baseUnit} != ${unit}`
    );
  }

  return ingredient.pricePerBaseUnit * qty;
}

export function calculateSubRecipeCost(
  subRecipe: SubRecipe,
  ingredientsById: Map<string, Ingredient>
): number {
  return subRecipe.items.reduce((total, item) => {
    const ingredient = ingredientsById.get(item.ingredientId);
    if (!ingredient) {
      throw new Error(`ingrediente inexistente: ${item.ingredientId}`);
    }

    return (
      total + calculateIngredientCost(ingredient, item.qty, item.unit)
    );
  }, 0);
}

export type RecipeCost = {
  total: number;
  perPax: number;
};

export function calculateRecipeCost(
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
  subRecipesById: Map<string, SubRecipe>
): RecipeCost {
  if (!Number.isFinite(recipe.pax) || recipe.pax <= 0) {
    throw new Error("pax debe ser un numero positivo");
  }

  const total = recipe.items.reduce((sum, item) => {
    return sum + calculateRecipeItemCost(item, ingredientsById, subRecipesById);
  }, 0);

  return {
    total,
    perPax: total / recipe.pax,
  };
}

function calculateRecipeItemCost(
  item: RecipeItem,
  ingredientsById: Map<string, Ingredient>,
  subRecipesById: Map<string, SubRecipe>
): number {
  if (!Number.isFinite(item.qty) || item.qty <= 0) {
    throw new Error("qty debe ser un numero positivo");
  }

  if (item.kind === "ingredient") {
    const ingredient = ingredientsById.get(item.ingredientId);
    if (!ingredient) {
      throw new Error(`ingrediente inexistente: ${item.ingredientId}`);
    }

    return calculateIngredientCost(ingredient, item.qty, item.unit);
  }

  const subRecipe = subRecipesById.get(item.subRecipeId);
  if (!subRecipe) {
    throw new Error(`subreceta inexistente: ${item.subRecipeId}`);
  }

  if (item.unit !== "unit") {
    throw new Error("subreceta solo puede expresarse en unit");
  }

  const subRecipeCost = calculateSubRecipeCost(subRecipe, ingredientsById);
  return subRecipeCost * item.qty;
}
