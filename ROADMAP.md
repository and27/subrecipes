# ROADMAP.md — Costing Recipes V0

Este roadmap define el alcance de **V0** y su ejecución. No incluye Post-V1 salvo como hipótesis separada.

## V0 Promise (1 frase)

Subo una factura, corrijo rápidamente ítems y unidades, obtengo **$/unidad base**, y calculo el costo de **subrecetas y recetas** (con PAX) **offline**.

## Done = V0 está terminado cuando

- Upload factura real → items detectados → corrección manual → catálogo de precios base
- CRUD mínimo de subrecetas (solo ingredientes) y recetas (ingredientes + subrecetas)
- Costo total + costo por porción
- Funciona offline (persistencia en IndexedDB)
- Demo cerrada con datos seed y flujo entendible para el profesor
- Navegación multipágina con sidebar: Ingredientes, Subrecetas y Recetas

---

## Epics & Issues (V0)

### EPIC 0 — Fundaciones mínimas

- [ ] Project scaffold (Next + TS + Tailwind + shadcn + PWA basics)
- [ ] Define base units config + conversion helpers
- [ ] Define ports (interfaces) + composition root mínimo

### EPIC 1 — App shell multipágina (navegación base)

- [ ] Layout general con sidebar persistente
- [ ] Rutas separadas: `/ingredientes`, `/subrecetas`, `/recetas`
- [ ] Vista de ingredientes en tabla (lectura inicial)
- [ ] Vistas de subrecetas y recetas en formato lista (lectura inicial)

### EPIC 2 — Ingesta de factura (imagen → texto → items)

- [ ] UI: subir imagen + preview + crear invoice draft
- [ ] Endpoint: imagen → texto (visión/OCR) + flag de baja calidad
- [ ] LLM: texto → JSON items (schema mínimo)
- [ ] UI: mostrar tabla inicial de items detectados

### EPIC 3 — Corrección + normalización a unidad base

- [ ] Tabla editable (description, qty, unit, line_total)
- [ ] Normalización: mapear a ingrediente existente / crear nuevo
- [ ] Selección de base unit por ingrediente
- [ ] Cálculo y persistencia: `price_per_base_unit`

### EPIC 4 — Persistencia offline (Dexie / IndexedDB)

- [ ] Definir schema Dexie (tablas + índices)
- [ ] Implementar adapters Dexie para repositorios (ports)
- [ ] Persistencia/hidratación al reload (offline real)

### EPIC 5 — Subrecetas (nivel 1)

- [ ] UI: CRUD mínimo subrecetas (componentes: ingredientes)
- [ ] Cálculo costo subreceta (suma)
- [ ] Guardrail: subreceta NO incluye subreceta

### EPIC 6 — Recetas (nivel 2)

- [ ] UI: CRUD mínimo recetas (ingredientes + subrecetas) + yield (PAX)
- [ ] Cálculo costo receta + costo por porción
- [ ] Guardrails: max depth 2 + error claro si inválido

### EPIC 7 — Demo cerrada

- [ ] Seed: 1 factura + 5–10 ingredientes + 1 subreceta + 1 receta
- [ ] Validación end-to-end: nueva factura cambia costos
- [ ] “Modo demo”: navegación limpia, errores claros, sin data rota

### EPIC 8 — UX mínima

- [ ] Flujo step-based: Factura → Corrección → Catálogo → Recetas
- [ ] Estados: loading/empty/error + mensajes accionables
- [ ] Indicadores de confianza y “no certeza” (confidence)

---

## Post-V1 (hipótesis, NO backlog)

- Subrecetas anidadas ilimitadas + detección avanzada de ciclos
- Rendimiento/merma
- IVA
- Historial de precios y proveedores
- Export (PDF/CSV)
- DB remota (Postgres/Supabase) + multi-user
