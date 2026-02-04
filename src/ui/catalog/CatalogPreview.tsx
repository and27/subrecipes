"use client";

import { useEffect, useMemo, useState } from "react";

import type { CatalogSnapshot } from "@/application/get-catalog-snapshot";
import type { RecipeCost } from "@/domain/costing";
import { appServices } from "@/composition/root";
import { Button } from "@/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/ui/card";

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CatalogPreview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [snapshot, setSnapshot] = useState<CatalogSnapshot | null>(null);
  const [recipeCost, setRecipeCost] = useState<RecipeCost | null>(null);

  const onlineLabel = useMemo(() => {
    if (typeof navigator === "undefined") {
      return "desconocido";
    }
    return navigator.onLine ? "en linea" : "sin conexion";
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const seedResult = await appServices.ensureDemoSeed();
        if (!active) return;
        setSeeded(seedResult.seeded);

        const data = await appServices.getCatalogSnapshot();
        if (!active) return;
        setSnapshot(data);

        const firstRecipe = data.recipes[0];
        if (firstRecipe) {
          const cost = await appServices.calculateRecipeCostById(firstRecipe.id);
          if (!active) return;
          setRecipeCost(cost);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de datos</CardTitle>
          <CardDescription>
            Persistencia local activa. Base IndexedDB con seed inicial de demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
            <span>Conectividad: {onlineLabel}</span>
            <span>Seed aplicado: {seeded ? "si" : "ya estaba"}</span>
            <span>
              Registros: {snapshot ? snapshot.ingredients.length : "-"} ingredientes
            </span>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {loading && (
            <p className="text-sm text-foreground/60">
              Cargando datos locales...
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Catalogo demo</CardTitle>
            <CardDescription>
              Ingredientes base con precio por unidad base (placeholder).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshot?.ingredients.slice(0, 6).map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {ingredient.name}
                  </span>
                  <span className="text-foreground/60">
                    {formatNumber(ingredient.pricePerBaseUnit)} / {ingredient.baseUnit}
                  </span>
                </div>
              ))}
              {!snapshot && !loading && (
                <p className="text-sm text-foreground/60">
                  No hay ingredientes cargados.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receta demo</CardTitle>
            <CardDescription>
              Costo total y por porcion calculados con el motor de dominio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot?.recipes[0] && recipeCost ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">Receta</span>
                  <span className="font-medium text-foreground">
                    {snapshot.recipes[0].name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">Costo total</span>
                  <span className="font-medium">
                    {formatNumber(recipeCost.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">Costo por porcion</span>
                  <span className="font-medium">
                    {formatNumber(recipeCost.perPax)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/60">
                Aun no hay recetas listas para calcular.
              </p>
            )}
            <Button variant="outline" size="sm" disabled>
              Cargar factura (proximamente)
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
