import type { Ingredient, Recipe, SubRecipe } from "@/domain/models";
import type { CatalogRepositories } from "./types";

const SEED_KEY = "seed_version";
const SEED_VERSION = "2026-02-05-v2";

const ingredients: Ingredient[] = [
  {
    id: "ing-aceite",
    name: "Aceite vegetal",
    baseUnit: "ml",
    pricePerBaseUnit: 0.0026,
  },
  {
    id: "ing-arroz",
    name: "Arroz",
    baseUnit: "g",
    pricePerBaseUnit: 0.0024,
  },
  {
    id: "ing-pollo",
    name: "Pollo pechuga",
    baseUnit: "g",
    pricePerBaseUnit: 0.0065,
  },
  {
    id: "ing-cebolla",
    name: "Cebolla",
    baseUnit: "g",
    pricePerBaseUnit: 0.0012,
  },
  {
    id: "ing-pimiento",
    name: "Pimiento",
    baseUnit: "g",
    pricePerBaseUnit: 0.003,
  },
  {
    id: "ing-ajo",
    name: "Ajo",
    baseUnit: "g",
    pricePerBaseUnit: 0.0055,
  },
  {
    id: "ing-sal",
    name: "Sal",
    baseUnit: "g",
    pricePerBaseUnit: 0.0008,
  },
  {
    id: "ing-pimienta",
    name: "Pimienta",
    baseUnit: "g",
    pricePerBaseUnit: 0.012,
  },
  {
    id: "ing-arvejas",
    name: "Arvejas",
    baseUnit: "g",
    pricePerBaseUnit: 0.0032,
  },
  {
    id: "ing-caldo",
    name: "Caldo de pollo",
    baseUnit: "ml",
    pricePerBaseUnit: 0.0013,
  },
];

const subRecipes: SubRecipe[] = [
  {
    id: "sub-sofrito",
    name: "Sofrito base",
    yieldQty: 600,
    yieldUnit: "g",
    pax: 6,
    items: [
      { ingredientId: "ing-cebolla", qty: 300, unit: "g" },
      { ingredientId: "ing-pimiento", qty: 200, unit: "g" },
      { ingredientId: "ing-ajo", qty: 30, unit: "g" },
      { ingredientId: "ing-aceite", qty: 50, unit: "ml" },
      { ingredientId: "ing-sal", qty: 5, unit: "g" },
      { ingredientId: "ing-pimienta", qty: 2, unit: "g" },
    ],
  },
];

const recipes: Recipe[] = [
  {
    id: "rec-arroz-pollo",
    name: "Arroz con pollo",
    yieldQty: 2500,
    yieldUnit: "g",
    pax: 6,
    priceNet: 18,
    items: [
      {
        kind: "subrecipe",
        subRecipeId: "sub-sofrito",
        qty: 1,
        unit: "unit",
      },
      {
        kind: "ingredient",
        ingredientId: "ing-arroz",
        qty: 600,
        unit: "g",
      },
      {
        kind: "ingredient",
        ingredientId: "ing-pollo",
        qty: 800,
        unit: "g",
      },
      {
        kind: "ingredient",
        ingredientId: "ing-arvejas",
        qty: 200,
        unit: "g",
      },
      {
        kind: "ingredient",
        ingredientId: "ing-caldo",
        qty: 1000,
        unit: "ml",
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
