import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../api/client';
import type { DissonanceGraph } from '../types';

interface DissonanceState {
  graph: DissonanceGraph | null;
  loading: boolean;
  error: string | null;
  selectedNode: string | null;
  fetchGraph: () => Promise<void>;
  selectNode: (nodeId: string | null) => void;
}

export const useDissonanceStore = create<DissonanceState>()(
  devtools(
    (set, get) => ({
      graph: null,
      loading: false,
      error: null,
      selectedNode: null,

      fetchGraph: async () => {
        set({ loading: true, error: null });
        try {
          const graph = await api.dissonance.graph();
          set({ graph, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch dissonance graph', loading: false });
        }
      },

      selectNode: (nodeId) => set({ selectedNode: nodeId }),
    }),
    { name: 'DissonanceStore' }
  )
);
