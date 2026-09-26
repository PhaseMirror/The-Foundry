export interface RoutingDecision {
  gpuWeight: number; // percentage 0-100
  cpuWeight: number; // percentage 0-100
  ramWeight: number; // percentage 0-100
  vectorWidth: 128 | 256 | 512;
  activeThreads: number;
  batchSize: number;
  energyEstimateJoulesPerTeraHash: number;
  mode: 'autonomous_ccre' | 'manual_override' | 'energy_saver';
}

export interface HardwareProfile {
  cpuCores: {
    id: number;
    usagePercent: number;
    tempCelsius: number;
    freqGhz: number;
  }[];
  gpuDevice: {
    name: string;
    coreTempCelsius: number;
    hotspotTempCelsius: number;
    vramTempCelsius: number;
    vramUsedMb: number;
    vramTotalMb: number;
    coreClockMhz: number;
    powerDrawWatts: number;
    fanRpm: number;
  };
  ramSubstrate: {
    ringBufferUsedMb: number;
    ringBufferTotalMb: number;
    lookupTableHitsPerSec: number;
    bandwidthGbps: number;
  };
}

export interface ThermalMonitor {
  maxTemp: number;
  ambientTemp: number;
  criticalTemp: number;
  throttleFactor: number; // 0.0 to 1.0 (1.0 = full speed, <1.0 = throttled)
  isThrottled: boolean;
  fanGovernorMode: 'auto_pid' | 'performance_curve' | 'silent' | 'manual_100';
  lastThermalTripTimestamp?: number;
}

export interface PilotReport {
  epochIndex: number;
  contraction: number; // Target < 0.05
  drift: number; // Target < 0.02
  resonance: number; // Target > 0.95
  leanProofStatus: 'PROVED_LEAN4' | 'REJECTED_DRIFT' | 'EVALUATING' | 'THROTTLED';
  proofTimeMs: number;
  witnessHash: string;
  lemmaName: string;
  formalVerificationDetails: {
    affineBoundSatisfied: boolean;
    normResidual: number;
    ccreStepValid: boolean;
    leanTheorem: string;
  };
}

export interface NonceCandidate {
  id: string;
  timestamp: number;
  nonceHex: string;
  hash: string;
  leadingZeros: number;
  substrateSource: 'GPU_CUDA' | 'CPU_AVX512' | 'RAM_AFFINE_LUT';
  blockHeight: number;
  difficultyTarget: string;
  witnessHash: string;
  status: 'CANDIDATE' | 'BLOCK_SOLVED' | 'BELOW_TARGET' | 'PILOT_REJECTED';
  merkleRoot: string;
}

export interface WormAuditEntry {
  id: string;
  seqId: number;
  timestamp: number;
  eventType: 'MINING_CYCLE' | 'PILOT_VERIFIED' | 'PILOT_REJECTED' | 'ROUTING_REBALANCE' | 'THERMAL_TRIP' | 'BLOCK_FOUND' | 'WASM_REPLAY';
  payloadHash: string;
  prevHash: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
}

export interface TelemetrySnapshot {
  timestamp: number;
  hashrateThs: number;
  instantHashrateThs: number;
  powerConsumptionWatts: number;
  energyEfficiencyJTh: number;
  totalNoncesExamined: number;
  candidatesFound: number;
  blocksSolved: number;
  routing: RoutingDecision;
  hardware: HardwareProfile;
  thermal: ThermalMonitor;
  pilot: PilotReport;
  recentCandidates: NonceCandidate[];
  wormLogs: WormAuditEntry[];
  network: {
    blockHeight: number;
    networkDifficultyT: number;
    mempoolTxCount: number;
    estimatedBlockRewardBtc: number;
    blockTimeRemainingSec: number;
  };
  ipcStatus: {
    socketPath: string;
    connected: boolean;
    pingLatencyMs: number;
    bufferOccupancyPercent: number;
    flatpakAppId: string;
  };
}
