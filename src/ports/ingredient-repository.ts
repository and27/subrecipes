import type { Ingredient } from "@/domain/models";

export interface IngredientRepository {
  list(): Promise<Ingredient[]>;
  getById(id: string): Promise<Ingredient | undefined>;
  upsertMany(items: Ingredient[]): Promise<void>;
  clear(): Promise<void>;
}
