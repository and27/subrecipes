import type { BaseUnit } from "./units";

export type Ingredient = {
  id: string;
  name: string;
  baseUnit: BaseUnit;
  pricePerBaseUnit: number;
};

export type SubRecipeItem = {
  ingredientId: string;
  qty: number;
  unit: BaseUnit;
};

export type SubRecipe = {
  id: string;
  name: string;
  items: SubRecipeItem[];
};

export type RecipeItem =
  | {
      kind: "ingredient";
      ingredientId: string;
      qty: number;
      unit: BaseUnit;
    }
  | {
      kind: "subrecipe";
      subRecipeId: string;
      qty: number;
      unit: "unit";
    };

export type Recipe = {
  id: string;
  name: string;
  items: RecipeItem[];
  pax: number;
};
