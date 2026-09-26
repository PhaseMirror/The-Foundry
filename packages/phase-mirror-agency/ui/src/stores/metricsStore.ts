import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../api/client';
import type { DaemonMetrics } from '../types';

interface MetricsState {
  metrics: DaemonMetrics | null;
  loading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

export const useMetricsStore = create<MetricsState>()(
  devtools(
    (set) => ({
      metrics: null,
      loading: false,
      error: null,

      fetchMetrics: async () => {
        set({ loading: true, error: null });
        try {
          const metrics = await api.metrics.daemon();
          set({ metrics, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch metrics', loading: false });
        }
      },
    }),
    { name: 'MetricsStore' }
  )
);
