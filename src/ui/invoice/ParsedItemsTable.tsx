import type { ParseInvoiceItem } from "@/domain/invoice-parse";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/ui/card";

type ParsedItemsTableProps = {
  items: ParseInvoiceItem[];
  isLoading: boolean;
  error: string | null;
  lowConfidence: boolean;
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
}: ParsedItemsTableProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Items detectados (mock)</CardTitle>
        <CardDescription>
          Resultado preliminar para pasar luego a correccion manual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <p className="text-sm text-info">Procesando imagen de factura...</p>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

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
                  <th className="px-4 py-3 font-medium">Descripcion</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Unidad</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Confianza</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={`${item.raw_description}-${index}`}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3 text-text">{item.raw_description}</td>
                    <td className="px-4 py-3 text-muted">{item.qty ?? "-"}</td>
                    <td className="px-4 py-3 text-muted">{item.unit ?? "-"}</td>
                    <td className="px-4 py-3 text-muted">{item.line_total}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatConfidence(item.confidence)}
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
