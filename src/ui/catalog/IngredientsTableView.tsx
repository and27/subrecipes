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
        <div className="flex flex-wrap gap-4 text-xs text-muted">
          <span>Seed aplicado: {seeded ? "si" : "ya estaba"}</span>
          <span>
            Registros: {snapshot ? snapshot.ingredients.length : "-"}
          </span>
        </div>

        {loading && <p className="text-sm text-muted">Cargando ingredientes...</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        {!loading && !error && snapshot && snapshot.ingredients.length === 0 && (
          <p className="text-sm text-muted">No hay ingredientes registrados.</p>
        )}

        {!loading && !error && snapshot && snapshot.ingredients.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-alt/70 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Ingrediente</th>
                  <th className="px-4 py-3 font-medium">Unidad base</th>
                  <th className="px-4 py-3 font-medium">Precio por unidad base</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-text">{ingredient.name}</td>
                    <td className="px-4 py-3 text-muted">{ingredient.baseUnit}</td>
                    <td className="px-4 py-3 text-muted">
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


