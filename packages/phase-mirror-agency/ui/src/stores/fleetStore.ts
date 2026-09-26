import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../api/client';
import type { Agent, Project } from '../types';

interface FleetState {
  agents: Agent[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  fetchProjects: () => Promise<void>;
}

export const useFleetStore = create<FleetState>()(
  devtools(
    (set, get) => ({
      agents: [],
      projects: [],
      loading: false,
      error: null,

      fetchAgents: async () => {
        set({ loading: true, error: null });
        try {
          const agents = await api.agents.list();
          set({ agents, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch fleet', loading: false });
        }
      },

      fetchProjects: async () => {
        if (get().projects.length > 0) return;
        set({ loading: true, error: null });
        try {
          const projects = await api.projects.list();
          set({ projects, loading: false });
        } catch (err: any) {
          set({ error: err.detail || 'Failed to fetch projects', loading: false });
        }
      },
    }),
    { name: 'FleetStore' }
  )
);
