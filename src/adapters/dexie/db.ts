import Dexie, { type Table } from "dexie";
import type { Ingredient, Recipe, SubRecipe } from "@/domain/models";
import type { MetaEntry } from "@/ports/meta-repository";

export class SubrecetasDexie extends Dexie {
  ingredients!: Table<Ingredient, string>;
  subRecipes!: Table<SubRecipe, string>;
  recipes!: Table<Recipe, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super("subrecetas");

    this.version(1).stores({
      ingredients: "id, name, baseUnit",
      subRecipes: "id, name",
      recipes: "id, name",
      meta: "key",
    });
  }
}

export function createDexieDb(): SubrecetasDexie {
  return new SubrecetasDexie();
}
