import type { BaseUnit, Unit } from "./units";

export type Ingredient = {
  id: string;
  name: string;
  baseUnit: BaseUnit;
  pricePerBaseUnit: number;
  priceUpdatedAt?: string;
  purchasePriceExVat?: number;
  purchaseQty?: number;
  purchaseUnit?: string;
  purchaseUnitCost?: number;
};

export type SubRecipeItem = {
  ingredientId: string;
  qty: number;
  unit: BaseUnit;
};

export type SubRecipe = {
  id: string;
  name: string;
  yieldQty: number;
  yieldUnit: Unit;
  pax: number;
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
