export type Web4ActionId =
  | "post_message"
  | "update_profile"
  | "grant_access"
  | "revoke_access";

export interface Web4MessagePayload {
  type: "message";
  content: string;
  tags?: string[];
}

export interface Web4ProfileUpdatePayload {
  type: "profile";
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Web4AccessPayload {
  type: "access";
  targetIdentityId: string;
  scope: string[];
}

export type Web4Payload =
  | Web4MessagePayload
  | Web4ProfileUpdatePayload
  | Web4AccessPayload;

export interface Web4StateSnapshot {
  events: Array<{
    id: string;
    action: Web4ActionId;
    actorId: string;
    payload: Web4Payload;
    timestamp: number;
  }>;
}
