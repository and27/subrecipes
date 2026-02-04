"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/ui/lib/utils";

const NAV_ITEMS = [
  {
    href: "/factura",
    label: "Factura",
    description: "Ingesta y borrador",
  },
  {
    href: "/ingredientes",
    label: "Ingredientes",
    description: "Catalogo base",
  },
  {
    href: "/subrecetas",
    label: "Subrecetas",
    description: "Preparaciones nivel 1",
  },
  {
    href: "/recetas",
    label: "Recetas",
    description: "Costo final por PAX",
  },
] as const;

function getPageTitle(pathname: string) {
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  return current?.label ?? "Subrecetas";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-border bg-surface/80 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="space-y-8 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Costing Recipes V0
            </p>
            <h1 className="mt-2 text-2xl [font-family:var(--font-display)]">
              Subrecetas
            </h1>
          </div>

          <nav className="grid gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl border border-border px-4 py-3 transition",
                    active
                      ? "bg-border-strong/30"
                      : "hover:border-border-strong hover:bg-surface-alt/70",
                  )}
                >
                  <p className="text-sm font-semibold text-text">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted">{item.description}</p>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <section>
        <header className="border-b border-border bg-bg/80 px-6 py-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Modulo activo
          </p>
          <h2 className="text-xl font-semibold text-text">
            {getPageTitle(pathname)}
          </h2>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </section>
    </div>
  );
}
