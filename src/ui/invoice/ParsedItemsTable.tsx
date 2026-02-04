import type { ParseInvoiceItem } from "@/domain/invoice-parse";
import type { Ingredient } from "@/domain/models";
import { toBaseQuantity, type Unit } from "@/domain/units";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";

type ParsedItemsTableProps = {
  items: ParseInvoiceItem[];
  isLoading: boolean;
  error: string | null;
  lowConfidence: boolean;
  rowErrors: Record<number, string[]>;
  onItemChange: (index: number, nextItem: ParseInvoiceItem) => void;
  ingredientOptions: string[];
  ingredientSelections: string[];
  ingredientMatches: boolean[];
  onIngredientChange: (index: number, nextName: string) => void;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
  saveMessage: string | null;
  saveError: string | null;
  pendingOverwrite: Ingredient[];
  onConfirmOverwrite: () => void;
  onCancelOverwrite: () => void;
};

function formatConfidence(value: number | undefined) {
  if (value === undefined) return "-";
  return `${Math.round(value * 100)}%`;
}

export function ParsedItemsTable({
  items,
  isLoading,
  error,
  lowConfidence,
  rowErrors,
  onItemChange,
  ingredientOptions,
  ingredientSelections,
  ingredientMatches,
  onIngredientChange,
  onSave,
  canSave,
  isSaving,
  saveMessage,
  saveError,
  pendingOverwrite,
  onConfirmOverwrite,
  onCancelOverwrite,
}: ParsedItemsTableProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Items detectados (mock)</CardTitle>
            <CardDescription>
              Resultado preliminar para pasar luego a correccion manual.
            </CardDescription>
          </div>
          <Button onClick={onSave} disabled={!canSave} size="sm" variant="outline">
            {isSaving ? "Guardando..." : "Guardar en catalogo"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <p className="text-sm text-info">Procesando imagen de factura...</p>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
        {saveMessage && <p className="text-sm text-success">{saveMessage}</p>}
        {saveError && <p className="text-sm text-danger">{saveError}</p>}
        {pendingOverwrite.length > 0 && (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
            <p className="font-semibold text-warning">
              Se detectaron ingredientes existentes:
            </p>
            <ul className="mt-2 list-disc pl-4">
              {pendingOverwrite.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={onConfirmOverwrite} size="sm">
                Actualizar precios
              </Button>
              <Button onClick={onCancelOverwrite} size="sm" variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <p className="text-sm text-muted">Aun no hay items detectados.</p>
        )}

        {lowConfidence && !isLoading && !error && items.length > 0 && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
            Confianza baja detectada. Revisar manualmente cada item antes de guardar.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-alt/70 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Descripcion (OCR)</th>
                  <th className="px-4 py-3 font-medium">Ingrediente</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Unidad</th>
                  <th className="px-4 py-3 font-medium">Total (sin IVA)</th>
                  <th className="px-4 py-3 font-medium">Confianza</th>
                  <th className="px-4 py-3 font-medium">Validacion</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={`item-row-${index}`}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3 text-text">
                      <input
                        value={item.raw_description}
                        onChange={(event) =>
                          onItemChange(index, {
                            ...item,
                            raw_description: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface-alt px-2 py-1 text-sm text-text"
                      />
                    </td>
                    <td className="px-4 py-3 text-text">
                      <input
                        list="ingredient-options"
                        value={ingredientSelections[index] ?? ""}
                        onChange={(event) =>
                          onIngredientChange(index, event.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-surface-alt px-2 py-1 text-sm text-text"
                      />
                      <p className="mt-1 text-[11px] text-muted">
                        {ingredientSelections[index]
                          ? ingredientMatches[index]
                            ? "Existente"
                            : "Nuevo ingrediente"
                          : "Seleccione ingrediente"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          onItemChange(index, {
                            ...item,
                            qty: value === "" ? undefined : Number(value),
                          });
                        }}
                        className="w-24 rounded-lg border border-border bg-surface-alt px-2 py-1 text-sm text-text"
                      />
                      <p className="mt-1 text-[11px] text-muted">
                        Cantidad base: {renderBaseQty(item)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <select
                        value={item.unit ?? ""}
                        onChange={(event) =>
                          onItemChange(index, {
                            ...item,
                            unit: event.target.value || undefined,
                          })
                        }
                        className="w-24 rounded-lg border border-border bg-surface-alt px-2 py-1 text-sm text-text"
                      >
                        <option value="">-</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="unit">unit</option>
                      </select>
                      <p className="mt-1 text-[11px] text-muted">
                        Unidad base: {renderBaseUnit(item)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.line_total}
                        onChange={(event) =>
                          onItemChange(index, {
                            ...item,
                            line_total: Number(event.target.value || 0),
                          })
                        }
                        className="w-28 rounded-lg border border-border bg-surface-alt px-2 py-1 text-sm text-text"
                      />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatConfidence(item.confidence)}
                    </td>
                    <td className="px-4 py-3">
                      {rowErrors[index]?.length ? (
                        <span className="text-xs text-danger">
                          {rowErrors[index][0]}
                        </span>
                      ) : (
                        <span className="text-xs text-success">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <datalist id="ingredient-options">
              {ingredientOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderBaseQty(item: ParseInvoiceItem) {
  if (item.qty === undefined || !item.unit) return "-";

  try {
    const { baseQty } = toBaseQuantity(item.qty, item.unit as Unit);
    return baseQty;
  } catch {
    return "-";
  }
}

function renderBaseUnit(item: ParseInvoiceItem) {
  if (item.qty === undefined || !item.unit) return "-";

  try {
    const { baseUnit } = toBaseQuantity(item.qty, item.unit as Unit);
    return baseUnit;
  } catch {
    return "-";
  }
}
