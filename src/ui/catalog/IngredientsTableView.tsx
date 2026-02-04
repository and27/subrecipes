"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { useCatalogData } from "@/ui/catalog/use-catalog-data";

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function IngredientsTableView() {
  const { loading, error, seeded, snapshot } = useCatalogData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalogo de ingredientes</CardTitle>
        <CardDescription>
          Tabla inicial en modo lectura para validar unidad base y costo por unidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
          <span>Seed aplicado: {seeded ? "si" : "ya estaba"}</span>
          <span>
            Registros: {snapshot ? snapshot.ingredients.length : "-"}
          </span>
        </div>

        {loading && <p className="text-sm text-foreground/60">Cargando ingredientes...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && snapshot && snapshot.ingredients.length === 0 && (
          <p className="text-sm text-foreground/60">No hay ingredientes registrados.</p>
        )}

        {!loading && !error && snapshot && snapshot.ingredients.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-foreground/10">
            <table className="min-w-full text-sm">
              <thead className="bg-foreground/5 text-left text-foreground/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Ingrediente</th>
                  <th className="px-4 py-3 font-medium">Unidad base</th>
                  <th className="px-4 py-3 font-medium">Precio por unidad base</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="border-t border-foreground/10">
                    <td className="px-4 py-3 font-medium text-foreground">{ingredient.name}</td>
                    <td className="px-4 py-3 text-foreground/70">{ingredient.baseUnit}</td>
                    <td className="px-4 py-3 text-foreground/70">
                      {formatNumber(ingredient.pricePerBaseUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
