import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface QCalcJob {
  id: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  progress: number;
  contraction: number;
  operatorNorm: number;
  lambdaT: number;
  gapLb: number;
  result: number[] | null;
  logs: string[];
}

interface QCalcState {
  job: QCalcJob;
  setLambdaM: (lambdaM: number) => void;
  setTimeEnd: (timeEnd: number) => void;
  toggleStratum: (id: number) => void;
  run: () => void;
  reset: () => void;
}

const initialState: QCalcState['job'] = {
  id: 'idle',
  status: 'idle',
  progress: 0,
  contraction: 0.84,
  operatorNorm: 0.84 * 0.72,
  lambdaT: 0.84 * 0.28,
  gapLb: 0.16,
  result: null,
  logs: [],
};

export const useQCalcStore = create<QCalcState>()(
  devtools(
    (set, get) => ({
      job: initialState,

      setLambdaM: (lambdaM) =>
        set((state) => ({
          job: { ...state.job, lambdaM },
        })),

      setTimeEnd: (timeEnd) =>
        set((state) => ({
          job: { ...state.job, timeEnd },
        })),

      toggleStratum: (id) => {
        set((state) => {
          const active = state.job.activeStrata ?? [];
          const next = active.includes(id)
            ? active.filter((s) => s !== id)
            : [...active, id].sort((a, b) => a - b);
          return { job: { ...state.job, activeStrata: next } };
        });
      },

      run: () => {
        set((state) => ({
          job: {
            ...state.job,
            status: 'running',
            progress: 0,
            logs: [`[${new Date().toLocaleTimeString()}] Starting simulation...`],
          },
        }));

        setTimeout(() => {
          const job = get().job;
          const result = [0.1234, 0.5678];
          set({
            job: {
              ...job,
              status: 'complete',
              progress: 100,
              result,
              logs: [
                ...job.logs,
                `[${new Date().toLocaleTimeString()}] Convergence achieved.`,
                `[${new Date().toLocaleTimeString()}] Result: [${result[0].toFixed(4)}, ${result[1].toFixed(4)}]`,
              ],
            },
          });
        }, 1500);
      },

      reset: () => set({ job: initialState }),
    }),
    { name: 'QCalcStore' }
  )
);
