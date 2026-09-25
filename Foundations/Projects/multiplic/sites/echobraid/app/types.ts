
export interface Message {
  id: string;
  sender: 'user' | 'system' | 'guide';
  text: string;
  timestamp: number;
  type: 'text' | 'pause-offer' | 'reflection';
  metadata?: {
    driftLevel?: number; // 0-1, represents semantic drift
    tone?: string;
  };
}

export interface SessionConfig {
  mode: 'soft-loop' | 'holo-scriptor' | 'coherence' | 'pulse';
  silencePreference: 'frequent' | 'standard' | 'rare' | 'off';
  dataRetention: 'immediate' | '24h' | '7d' | 'never';
}

export interface PrimePrompt {
  id: string;
  prime: number; // e.g., 2, 3, 5, 7
  category: 'Clarity' | 'Intention' | 'Emotion' | 'Structure';
  text: string;
}

export interface MetricPoint {
  time: string;
  value: number;
  label?: string;
}

export enum CoherenceState {
  STABLE = 'stable',
  DRIFTING = 'drifting',
  DIVERGENT = 'divergent',
}

export interface SavedReflection {
  id: string;
  text: string;
  promptText: string;
  timestamp: number;
}
