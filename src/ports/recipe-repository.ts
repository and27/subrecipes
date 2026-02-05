import type { Recipe } from "@/domain/models";

export interface RecipeRepository {
  list(): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | undefined>;
  upsertMany(items: Recipe[]): Promise<void>;
  deleteById(id: string): Promise<void>;
  clear(): Promise<void>;
}
