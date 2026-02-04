# AGENTS.md — Costing Recipes V0

Este documento define reglas mínimas de contribución: arquitectura, datos, UX, workflow y calidad. No es un roadmap.

## Propósito

Construir una **PWA offline-first** para calcular costos reales de **recetas y subrecetas** a partir de **facturas de supermercado** (foto). La IA propone borradores; el usuario corrige; el sistema calcula costos por unidad base y por porción (PAX).

---

## Stack (V0)

- Next.js (App Router) + React + TypeScript
- UI: shadcn/ui + Tailwind
- Persistencia offline: IndexedDB + Dexie
- IA: endpoint server `/api/parse-invoice` (visión → texto → JSON)
- Arquitectura: Usecases + Ports & Adapters (sin DDD ceremonial)

---

## Arquitectura (contratos mínimos)

- Capas explícitas y límites de importación:
  - `ui/` (React components, pages)
  - `application/` (usecases)
  - `domain/` (types + lógica pura)
  - `ports/` (interfaces)
  - `adapters/` (Dexie, API clients)
  - `composition/` (composition root)
- La UI **no depende** de Dexie ni de detalles de infraestructura.
- El dominio **no importa** nada de React/Next/Dexie.
- La composición del runtime vive en **un solo lugar** (composition root).

### Anti-ceremonial

- No “aggregates”, no “entities everywhere”, no factories innecesarias.
- Interfaces (ports) solo si se usan en V0.
- Preferir funciones puras y tipos simples.

---

## Offline-first (regla dura)

- La app debe funcionar offline para todo **excepto** la extracción de factura.
- Persistencia local obligatoria con Dexie.
- Sin auth, sin multiusuario, sin DB remota en V0.

---

## IA / Extracción (regla dura)

- La IA produce un **borrador**, nunca la verdad.
- Paso de **corrección obligatorio** antes de:
  - calcular costos
  - guardar precios unitarios
- Si la factura es ilegible o baja confianza → pedir foto más clara.

### Contrato mínimo esperado del LLM

- `items[]` con:
  - `raw_description: string`
  - `line_total: number`
  - opcional: `qty?: number`, `unit?: string`
  - `confidence?: number`

---

## Unidades & base units

- Base units conceptuales: `g | ml | unit`
- Otras unidades pueden existir (configurable) pero deben convertirse explícitamente a base units:
  - `kg → g`
  - `l → ml`
  - etc.
- No adivinar unidades. El usuario confirma.

---

## Recetas & subrecetas (guardrails)

- Profundidad máxima V0: **2 niveles**
  - `Recipe → SubRecipe → Ingredients`
- Una **SubRecipe** solo puede contener **ingredientes**, no subrecetas.
- No ciclos. Si se detecta algo inválido → error claro y bloquea guardado.

---

## Modelado de datos

- IDs como `string` (uuid-like).
- Fechas como ISO strings.
- Enums cerrados (no strings libres) para unidades y tipos.
- “Item limpio” existe solo después de la corrección del usuario.

---

## Workflow de desarrollo (regla dura)

- Avance **progresivo** por funcionalidades pequeñas.
- Debe existir **1 issue de GitHub por cada funcionalidad** antes de programar.
- **No se escribe código sin issue previo** que defina alcance y criterio de aceptación.
- El desarrollo debe referenciar siempre el issue correspondiente (branch, commits y PR cuando aplique).

---

## Migraciones
