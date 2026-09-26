import type {
  PolicyEngine,
  Intent,
  StateView,
  ProofBundle,
  PolicyVerdict,
  PolicyContext
} from "@mtpi/kernel";

import type { Web4ActionId, Web4StateSnapshot, Web4Payload } from "./schemas";
import { defaultWeb4CircuitConfig } from "./circuits";

function asWeb4Action(action: string): Web4ActionId {
  return action as Web4ActionId;
}

function asWeb4State(state: StateView): Web4StateSnapshot {
  return (state.snapshot ?? { events: [] }) as Web4StateSnapshot;
}

function asWeb4Payload(payload: unknown): Web4Payload {
  return payload as Web4Payload;
}

export const makeWeb4PolicyEngine = (): PolicyEngine => {
  return {
    evaluate(
      intent: Intent,
      state: StateView,
      proofs: ProofBundle[],
      context: PolicyContext = {
        infra: {
          origin: "LOCAL",
          healthScore: 100,
          healthCategory: "GREEN"
        }
      }
    ): Promise<PolicyVerdict> {
      const action = asWeb4Action(intent.action);
      const web4State = asWeb4State(state);
      const payload = asWeb4Payload(intent.payload);

      const hasUserRole = intent.roles.some(
        (credential) =>
          credential.roleId === "web4.user" &&
          (!credential.expiresAt || credential.expiresAt > Date.now())
      );

      if (!hasUserRole) {
        return Promise.resolve({
          decision: "DENY",
          reasons: ["MISSING_ROLE:web4.user"],
          primeGateOpen: false,
          drift: 0,
          csl: { commutes: false, silence: false },
          resonanceBudget: { R96: 0, ok: false },
          transport: undefined,
          infra: context.infra,
          action: "silent",
          auditEvents: []
        });
      }

      const requiredCircuit =
        defaultWeb4CircuitConfig.requiredCircuits[action];

      if (requiredCircuit) {
        const hasProof = proofs.some((bundle) => bundle.circuitId === requiredCircuit);

        if (!hasProof) {
          return Promise.resolve({
            decision: "NEED_MORE_PROOF",
            reasons: ["MISSING_PROOF"],
            requiredProofs: [requiredCircuit],
            primeGateOpen: false,
            drift: 0,
            csl: { commutes: false, silence: false },
            resonanceBudget: { R96: 0, ok: false },
            transport: undefined,
            infra: context.infra,
            action: "silent",
            auditEvents: []
          });
        }
      }

      if (payload.type === "message" && !payload.content?.trim()) {
        return Promise.resolve({
          decision: "DENY",
          reasons: ["EMPTY_MESSAGE"],
          primeGateOpen: false,
          drift: 0,
          csl: { commutes: false, silence: false },
          resonanceBudget: { R96: 0, ok: false },
          transport: undefined,
          infra: context.infra,
          action: "silent",
          auditEvents: []
        });
      }

      void web4State;

      return Promise.resolve({
        decision: "ALLOW",
        primeGateOpen: true,
        drift: 0,
        csl: { commutes: true, silence: false },
        resonanceBudget: { R96: 100, ok: true },
        transport: undefined,
        infra: context.infra,
        action: "submit",
        auditEvents: []
      });
    }
  };
};
