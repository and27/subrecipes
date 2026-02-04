export const BASE_UNITS = ["g", "ml", "unit"] as const;
export type BaseUnit = (typeof BASE_UNITS)[number];

export const UNITS = ["g", "kg", "ml", "l", "unit"] as const;
export type Unit = (typeof UNITS)[number];

const UNIT_TO_BASE: Record<Unit, BaseUnit> = {
  g: "g",
  kg: "g",
  ml: "ml",
  l: "ml",
  unit: "unit",
};

const UNIT_MULTIPLIER: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  unit: 1,
};

export type BaseQuantity = {
  baseUnit: BaseUnit;
  baseQty: number;
};

export function toBaseQuantity(qty: number, unit: Unit): BaseQuantity {
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("qty debe ser un numero positivo");
  }

  const baseUnit = UNIT_TO_BASE[unit];
  const baseQty = qty * UNIT_MULTIPLIER[unit];

  return { baseUnit, baseQty };
}

export function isBaseUnit(unit: string): unit is BaseUnit {
  return (BASE_UNITS as readonly string[]).includes(unit);
}
