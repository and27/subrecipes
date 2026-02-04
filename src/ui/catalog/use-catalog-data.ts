"use client";

import { useCallback, useEffect, useState } from "react";

import type { CatalogSnapshot } from "@/application/get-catalog-snapshot";
import { appServices } from "@/composition/root";

export type UseCatalogDataResult = {
  loading: boolean;
  error: string | null;
  seeded: boolean;
  snapshot: CatalogSnapshot | null;
  refresh: () => Promise<void>;
};

export function useCatalogData(): UseCatalogDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [snapshot, setSnapshot] = useState<CatalogSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const seedResult = await appServices.ensureDemoSeed();
      setSeeded(seedResult.seeded);

      const data = await appServices.getCatalogSnapshot();
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    error,
    seeded,
    snapshot,
    refresh,
  };
}
