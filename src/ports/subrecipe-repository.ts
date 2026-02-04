import type { SubRecipe } from "@/domain/models";

export interface SubRecipeRepository {
  list(): Promise<SubRecipe[]>;
  getById(id: string): Promise<SubRecipe | undefined>;
  upsertMany(items: SubRecipe[]): Promise<void>;
  clear(): Promise<void>;
}
