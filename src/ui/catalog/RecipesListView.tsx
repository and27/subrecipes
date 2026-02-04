"use client";

import { useEffect, useState } from "react";

import type { RecipeCost } from "@/domain/costing";
import { appServices } from "@/composition/root";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { useCatalogData } from "@/ui/catalog/use-catalog-data";

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function RecipesListView() {
  const { loading, error, snapshot } = useCatalogData();
  const [costByRecipe, setCostByRecipe] = useState<Record<string, RecipeCost>>({});

  useEffect(() => {
    let active = true;

    const loadCosts = async () => {
      if (!snapshot || snapshot.recipes.length === 0) {
        setCostByRecipe({});
        return;
      }

      const entries = await Promise.all(
        snapshot.recipes.map(async (recipe) => {
          const cost = await appServices.calculateRecipeCostById(recipe.id);
          return [recipe.id, cost] as const;
        })
      );

      if (!active) return;

      setCostByRecipe(Object.fromEntries(entries));
    };

    loadCosts().catch(() => {
      if (!active) return;
      setCostByRecipe({});
    });

    return () => {
      active = false;
    };
  }, [snapshot]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de recetas</CardTitle>
        <CardDescription>
          Vista de lectura inicial con PAX y costo calculado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-foreground/60">Cargando recetas...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && snapshot && snapshot.recipes.length === 0 && (
          <p className="text-sm text-foreground/60">No hay recetas registradas.</p>
        )}

        {!loading && !error && snapshot && snapshot.recipes.length > 0 && (
          <ul className="space-y-3">
            {snapshot.recipes.map((recipe) => {
              const cost = costByRecipe[recipe.id];

              return (
                <li
                  key={recipe.id}
                  className="rounded-2xl border border-foreground/10 bg-background/70 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{recipe.name}</p>
                    <p className="text-xs text-foreground/60">PAX: {recipe.pax}</p>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-foreground/70">
                    <span>
                      Costo total: {cost ? formatNumber(cost.total) : "calculando..."}
                    </span>
                    <span>
                      Costo por porcion: {cost ? formatNumber(cost.perPax) : "calculando..."}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
