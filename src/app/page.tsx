import { CatalogPreview } from "@/ui/catalog/CatalogPreview";
import { Button } from "@/ui/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-foreground/10 bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
              PWA offline-first
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Subrecetas · Costing Recipes V0
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" disabled>
              Subir factura
            </Button>
            <Button size="sm" disabled>
              Iniciar flujo
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-12 px-6 py-12">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground [font-family:var(--font-display)]">
              Costeo academico, trazable y offline.
            </h2>
            <p className="text-base leading-relaxed text-foreground/70">
              Esta version V0 prioriza el flujo completo: cargar una factura,
              corregir items, normalizar unidades y calcular costos por unidad base
              y por porcion. Todo persiste localmente desde el primer uso.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" disabled>
                Ver roadmap
              </Button>
              <Button variant="ghost" size="sm" disabled>
                Guia de correccion
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-surface/80 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Flujo V0
            </h3>
            <div className="mt-5 space-y-4 text-sm text-foreground/70">
              <p>1. Factura: subir imagen y obtener items preliminares.</p>
              <p>2. Correccion: validar cantidades, unidades y totales.</p>
              <p>3. Catalogo: guardar precios por unidad base.</p>
              <p>4. Subrecetas y recetas: calcular costo total y por porcion.</p>
            </div>
            <div className="mt-6 rounded-2xl bg-foreground/5 p-4 text-xs text-foreground/60">
              Limites V0: profundidad maxima 2 niveles, sin subrecetas anidadas.
            </div>
          </div>
        </section>

        <CatalogPreview />
      </main>
    </div>
  );
}
