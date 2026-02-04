"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { useCatalogData } from "@/ui/catalog/use-catalog-data";

export function SubRecipesListView() {
  const { loading, error, snapshot } = useCatalogData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de subrecetas</CardTitle>
        <CardDescription>
          Vista de lectura inicial para preparaciones de nivel 1.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-foreground/60">Cargando subrecetas...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && snapshot && snapshot.subRecipes.length === 0 && (
          <p className="text-sm text-foreground/60">No hay subrecetas registradas.</p>
        )}

        {!loading && !error && snapshot && snapshot.subRecipes.length > 0 && (
          <ul className="space-y-3">
            {snapshot.subRecipes.map((subRecipe) => (
              <li
                key={subRecipe.id}
                className="rounded-2xl border border-foreground/10 bg-background/70 px-4 py-4"
              >
                <p className="text-sm font-semibold text-foreground">{subRecipe.name}</p>
                <p className="text-xs text-foreground/60">
                  Componentes: {subRecipe.items.length}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
