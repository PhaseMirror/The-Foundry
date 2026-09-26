// Sedona-aware ESI retention and spoliation tracking SDK
// This SDK interfaces with the legalese-scopist Rust WASM core.

export type RelevanceBand = "Unknown" | "Core" | "Important" | "Marginal" | "Irrelevant";

export interface EsiSource {
  id: string;
  system: string;
  esiType: string;
  custodian?: string;
  relevanceBand: RelevanceBand;
  litigationHoldActive: boolean;
}

export type GapSeverity = "Minor" | "Moderate" | "Severe";

export type SedonaEvent = 
  | { type: "PotentialClaimNoticed", data: { date: string, description: string } }
  | { type: "ComplaintFiled", data: { date: string, forum: string } }
  | { type: "RegulatoryInquiryOpened", data: { date: string, agency: string } }
  | { type: "LegalHoldIssued", data: { date: string, hold_id: string } }
  | { type: "LegalHoldAcknowledged", data: { date: string, hold_id: string, custodian: string } }
  | { type: "LegalHoldReleased", data: { date: string, hold_id: string } }
  | { type: "AutoDeletionSuspended", data: { date: string, system: string } }
  | { type: "AutoDeletionResumed", data: { date: string, system: string } }
  | { type: "DeletionAfterDuty", data: { date: string, system: string, esi_source?: string, reason: string } }
  | { type: "PreservationGapDetected", data: { date: string, description: string, severity: GapSeverity } };

export interface RetentionViolation {
  esiSourceId: string;
  systemId: string;
  issueType: "DeletionWhileOnHold" | "HoldNotImplemented" | "PolicyConflict" | "NoMatchingPolicy";
  description: string;
  sedonaPrinciples: string[];
}

export interface SpoliationRiskState {
  dutyTriggered: boolean;
  holdsActive: number;
  unacknowledgedHolds: number;
  postDutyDeletions: number;
  gapsDetected: number;
  currentRiskLevel: "None" | "Low" | "Medium" | "High" | "Critical";
}

export class LegalMatter {
  private matterId: string;
  private wasmInstance: any;

  constructor(matterId: string, wasmInstance: any) {
    this.matterId = matterId;
    this.wasmInstance = wasmInstance;
  }

  public async processEvent(event: SedonaEvent): Promise<SpoliationRiskState> {
    const eventJson = JSON.stringify(event);
    const state = this.wasmInstance.process_matter_event(this.matterId, eventJson);
    return state;
  }

  public getSummary(): string {
    return this.wasmInstance.get_matter_summary(this.matterId);
  }
}

export class RetentionAuditor {
  private wasmInstance: any;

  constructor(wasmInstance: any) {
    this.wasmInstance = wasmInstance;
  }

  public audit(policy: any, sources: EsiSource[]): RetentionViolation[] {
    const policyJson = JSON.stringify(policy);
    const sourcesJson = JSON.stringify(sources);
    const violations = this.wasmInstance.audit_retention(policyJson, sourcesJson);
    return violations;
  }
}

export async function createScopist(wasmModulePath: string) {
  console.log("Legalese Scopist SDK initialized.");
}
