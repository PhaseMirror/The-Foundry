import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../api/client';
import type { ArchivumEntry } from '../types';

interface ArchivumState {
  entries: ArchivumEntry[];
  loading: boolean;
  error: string | null;
  fetchLedger: () => Promise<void>;
  registerEntry: (metadata: Record<string, unknown>) => Promise<void>;
}

export const useArchivumStore = create<ArchivumState>()(
  devtools(
    (set, get) => ({
      entries: [],
      loading: false,
      error: null,

      fetchLedger: async () => {
        set({ loading: true, error: null });
        try {
          const entries = await api.archivum.ledger();
          set({ entries, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch ledger', loading: false });
        }
      },

      registerEntry: async (metadata) => {
        set({ loading: true, error: null });
        try {
          const entry = await api.archivum.register(metadata);
          set((state) => ({ entries: [entry, ...state.entries], loading: false }));
        } catch (err: any) {
          set({ error: err.detail || 'Registration failed', loading: false });
          throw err;
        }
      },
    }),
    { name: 'ArchivumStore' }
  )
);
