import type { Web4ActionId } from "./schemas";

export interface Web4CircuitConfig {
  requiredCircuits: Partial<Record<Web4ActionId, string>>;
}

export const defaultWeb4CircuitConfig: Web4CircuitConfig = {
  requiredCircuits: {
    post_message: "web4:identity.lawful"
  }
};
