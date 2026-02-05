import type { Ingredient, Recipe, SubRecipe } from "@/domain/models";
import type { CatalogRepositories } from "./types";

const SEED_KEY = "seed_version";
const SEED_VERSION = "2026-02-05-v1";

const ingredients: Ingredient[] = [
  {
    id: "ing-harina",
    name: "Harina 000",
    baseUnit: "g",
    pricePerBaseUnit: 0.0025,
  },
  {
    id: "ing-azucar",
    name: "Azucar",
    baseUnit: "g",
    pricePerBaseUnit: 0.0022,
  },
  {
    id: "ing-manteca",
    name: "Manteca",
    baseUnit: "g",
    pricePerBaseUnit: 0.01,
  },
  {
    id: "ing-leche",
    name: "Leche",
    baseUnit: "ml",
    pricePerBaseUnit: 0.0012,
  },
  {
    id: "ing-huevos",
    name: "Huevos",
    baseUnit: "unit",
    pricePerBaseUnit: 30,
  },
  {
    id: "ing-sal",
    name: "Sal",
    baseUnit: "g",
    pricePerBaseUnit: 0.0008,
  },
  {
    id: "ing-levadura",
    name: "Levadura",
    baseUnit: "g",
    pricePerBaseUnit: 0.02,
  },
  {
    id: "ing-chocolate",
    name: "Chocolate",
    baseUnit: "g",
    pricePerBaseUnit: 0.015,
  },
];

const subRecipes: SubRecipe[] = [
  {
    id: "sub-masa-basica",
    name: "Masa basica",
    yieldQty: 1200,
    yieldUnit: "g",
    pax: 8,
    items: [
      { ingredientId: "ing-harina", qty: 500, unit: "g" },
      { ingredientId: "ing-azucar", qty: 200, unit: "g" },
      { ingredientId: "ing-manteca", qty: 200, unit: "g" },
      { ingredientId: "ing-huevos", qty: 3, unit: "unit" },
      { ingredientId: "ing-leche", qty: 150, unit: "ml" },
      { ingredientId: "ing-sal", qty: 4, unit: "g" },
      { ingredientId: "ing-levadura", qty: 6, unit: "g" },
    ],
  },
];

const recipes: Recipe[] = [
  {
    id: "rec-torta-simple",
    name: "Torta simple",
    yieldQty: 1,
    yieldUnit: "unit",
    pax: 8,
    priceNet: 18,
    items: [
      {
        kind: "subrecipe",
        subRecipeId: "sub-masa-basica",
        qty: 1,
        unit: "unit",
      },
      {
        kind: "ingredient",
        ingredientId: "ing-chocolate",
        qty: 120,
        unit: "g",
      },
    ],
  },
];

export type SeedResult = {
  seeded: boolean;
  version: string;
};

export async function ensureDemoSeed(
  repositories: CatalogRepositories
): Promise<SeedResult> {
  const current = await repositories.metaRepository.get(SEED_KEY);
  if (current === SEED_VERSION) {
    return { seeded: false, version: SEED_VERSION };
  }

  await repositories.ingredientRepository.clear();
  await repositories.subRecipeRepository.clear();
  await repositories.recipeRepository.clear();

  await repositories.ingredientRepository.upsertMany(ingredients);
  await repositories.subRecipeRepository.upsertMany(subRecipes);
  await repositories.recipeRepository.upsertMany(recipes);

  await repositories.metaRepository.set({
    key: SEED_KEY,
    value: SEED_VERSION,
  });

  return { seeded: true, version: SEED_VERSION };
}
