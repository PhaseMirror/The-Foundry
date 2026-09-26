import { Tensor, Policy } from './types';

export const INITIAL_TENSORS: Tensor[] = [
  {
    id: 't-101',
    primeIndex: 3,
    name: "Tracey's Tensor",
    narrativeSummary: "Experience of medical neglect and procedural gaslighting in the welfare system.",
    semanticAxes: { dignity: 0.2, systemicHarm: 0.9, resilience: 0.8 },
    consent: {
      cognitiveExploration: 50,
      emotionalDepth: 20,
      institutionalSharing: false,
      simulationOnly: true,
      isRevoked: false
    },
    entanglementFactor: 0.85,
    timestamp: Date.now() - 100000
  },
  {
    id: 't-103',
    primeIndex: 7,
    name: "Case 103: Housing Denial",
    narrativeSummary: "Systemic exclusion from affordable housing based on algorithmic bias.",
    semanticAxes: { dignity: 0.4, systemicHarm: 0.7, resilience: 0.5 },
    consent: {
      cognitiveExploration: 75,
      emotionalDepth: 60,
      institutionalSharing: true,
      simulationOnly: false,
      isRevoked: false
    },
    entanglementFactor: 0.6,
    timestamp: Date.now() - 50000
  },
  {
    id: 't-107',
    primeIndex: 11,
    name: "Case 107: Benefits Cliff",
    narrativeSummary: "Sudden revocation of support due to minor income fluctuation.",
    semanticAxes: { dignity: 0.3, systemicHarm: 0.8, resilience: 0.4 },
    consent: {
      cognitiveExploration: 40,
      emotionalDepth: 30,
      institutionalSharing: true,
      simulationOnly: true,
      isRevoked: false
    },
    entanglementFactor: 0.75,
    timestamp: Date.now()
  }
];

export const AVAILABLE_POLICIES: Policy[] = [
  {
    id: 'p-1',
    name: 'Rapid Adjudication Act',
    description: 'Increases processing speed but reduces human oversight.',
    impactVector: { dignityModifier: -0.3, lambdaModifier: 0.4 }, // Increases drift (bad)
    active: false
  },
  {
    id: 'p-2',
    name: 'Dignity Conservation Protocol',
    description: 'Mandatory dignity checks before benefits termination.',
    impactVector: { dignityModifier: 0.5, lambdaModifier: -0.2 }, // Reduces drift (good)
    active: false
  },
  {
    id: 'p-3',
    name: 'Algorithmic Audit v2',
    description: 'Regular automated scanning for bias patterns.',
    impactVector: { dignityModifier: 0.1, lambdaModifier: -0.1 },
    active: false
  }
];