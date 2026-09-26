import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../api/client';
import type { Agent, Project, ADR, DaemonMetrics } from '../types';

interface GovernanceState {
  agents: Agent[];
  projects: Project[];
  adrs: ADR[];
  metrics: DaemonMetrics | null;
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAdrs: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

export const useGovernanceStore = create<GovernanceState>()(
  devtools(
    (set, get) => ({
      agents: [],
      projects: [],
      adrs: [],
      metrics: null,
      loading: false,
      error: null,

      fetchAgents: async () => {
        set({ loading: true, error: null });
        try {
          const agents = await api.agents.list();
          set({ agents, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch agents', loading: false });
        }
      },

      fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
          const projects = await api.projects.list();
          set({ projects, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch projects', loading: false });
        }
      },

      fetchAdrs: async () => {
        set({ loading: true, error: null });
        try {
          const adrs = await api.adrs.list();
          set({ adrs, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch ADRs', loading: false });
        }
      },

      fetchMetrics: async () => {
        try {
          const metrics = await api.metrics.daemon();
          set({ metrics });
        } catch (err: any) {
          console.error('Metrics fetch failed:', err.detail);
        }
      },
    }),
    { name: 'GovernanceStore' }
  )
);
