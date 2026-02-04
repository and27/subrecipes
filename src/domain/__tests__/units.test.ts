import { describe, expect, it } from "vitest";

import { toBaseQuantity } from "@/domain/units";

describe("toBaseQuantity", () => {
  it("convierte kg a g", () => {
    const result = toBaseQuantity(1.5, "kg");
    expect(result).toEqual({ baseUnit: "g", baseQty: 1500 });
  });

  it("convierte l a ml", () => {
    const result = toBaseQuantity(2, "l");
    expect(result).toEqual({ baseUnit: "ml", baseQty: 2000 });
  });

  it("mantiene unit", () => {
    const result = toBaseQuantity(3, "unit");
    expect(result).toEqual({ baseUnit: "unit", baseQty: 3 });
  });

  it("rechaza cantidades invalidas", () => {
    expect(() => toBaseQuantity(0, "g")).toThrow(/positivo/);
    expect(() => toBaseQuantity(-2, "ml")).toThrow(/positivo/);
  });
});
