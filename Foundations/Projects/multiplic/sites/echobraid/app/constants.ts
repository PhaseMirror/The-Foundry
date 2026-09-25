import { PrimePrompt } from './types';

export const COPY = {
  welcome: "We can just sit. Your pace is law here.",
  inputPlaceholder: "Breathe or write when ready...",
  offerPause: "We may be nearing something unsayable. Would a brief pause help?",
  afterPause: "Notice any shift, even subtle? No need to explain.",
  memoryWarning: "This session will vanish in 24 hours.",
  sensorConsent: "Voice can help me hear your pace. Shall we listen? You can turn this off anytime.",
};

export const PRIME_PROMPTS: PrimePrompt[] = [
  { id: 'p2', prime: 2, category: 'Clarity', text: "What is one thing that feels true right now?" },
  { id: 'p3', prime: 3, category: 'Intention', text: "Start, middle, end. Which part feels heaviest?" },
  { id: 'p5', prime: 5, category: 'Emotion', text: "Name five textures in your current experience." },
  { id: 'p7', prime: 7, category: 'Structure', text: "If this feeling had a shape, how many sides would it have?" },
];

export const MOCK_DRIFT_DATA = [
  { time: '00:00', value: 10 },
  { time: '05:00', value: 15 },
  { time: '10:00', value: 45 },
  { time: '15:00', value: 30 },
  { time: '20:00', value: 20 },
  { time: '25:00', value: 25 },
];