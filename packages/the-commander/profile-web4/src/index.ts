import { randomUUID } from "node:crypto";

import type {
  KernelProfile,
  Identity,
  RoleCredential,
  Intent,
  StateView,
  KernelConfig
} from "@mtpi/kernel";

import { makeWeb4PolicyEngine } from "./policies";
import type { Web4StateSnapshot, Web4ActionId, Web4Payload } from "./schemas";

export const WEB4_PROFILE_ID = "web4";

export const web4Profile: KernelProfile = {
  id: WEB4_PROFILE_ID,
  buildIntent(input: {
    action: string;
    actor: Identity;
    roles: RoleCredential[];
    payload: unknown;
  }): Promise<Intent> {
    const action = input.action as Web4ActionId;
    const payload = input.payload as Web4Payload;
    const now = Date.now();

    return Promise.resolve({
      id: randomUUID(),
      profile: WEB4_PROFILE_ID,
      action,
      actor: input.actor,
      roles: input.roles,
      payload,
      timestamp: now
    });
  },
  reduceState(state: StateView, intent: Intent): Promise<Web4StateSnapshot> {
    const snapshot: Web4StateSnapshot =
      (state.snapshot as Web4StateSnapshot) ?? { events: [] };

    const payload = intent.payload as Web4Payload;

    const newEvent = {
      id: randomUUID(),
      action: intent.action as Web4ActionId,
      actorId: intent.actor.id,
      payload,
      timestamp: intent.timestamp
    };

    return Promise.resolve({
      ...snapshot,
      events: [...snapshot.events, newEvent]
    });
  }
};

export function makeWeb4KernelConfig(partial: {
  identity: KernelConfig["identity"];
  proofs: KernelConfig["proofs"];
  state: KernelConfig["state"];
  audit: KernelConfig["audit"];
}): KernelConfig {
  return {
    profile: web4Profile,
    policy: makeWeb4PolicyEngine(),
    ...partial
  };
}

export * from "./schemas";
export * from "./circuits";
export { makeWeb4PolicyEngine } from "./policies";
