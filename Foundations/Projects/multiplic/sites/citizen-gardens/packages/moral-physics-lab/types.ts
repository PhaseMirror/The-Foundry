import * as d3 from 'd3';

export interface ConsentState {
  cognitiveExploration: number; // 0-100
  emotionalDepth: number; // 0-100
  institutionalSharing: boolean;
  simulationOnly: boolean;
  isRevoked: boolean;
}

export interface Tensor {
  id: string;
  primeIndex: number; // The "p" value
  name: string;
  narrativeSummary: string;
  semanticAxes: {
    dignity: number; // 0-1
    systemicHarm: number; // 0-1
    resilience: number; // 0-1
  };
  consent: ConsentState;
  entanglementFactor: number; // Alpha value
  timestamp: number;
}

export interface MoralFieldState {
  lambdaM: number; // Universal Multiplicity Constant
  dignityCurrent: number; // Noether current
  entropy: number;
  timeStep: number;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  impactVector: {
    dignityModifier: number;
    lambdaModifier: number;
  };
  active: boolean;
}

// D3 Types
export interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  type: 'survivor' | 'institution' | 'policy';
  tensor?: Tensor;
  group: number;
  radius: number;
}

export interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  value: number; // Strength of entanglement
  type: 'entanglement' | 'impact';
}