<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## schemas/agent-action-v1.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://phasemirror.io/schemas/agent-action/v1",
  "title": "AgentActionRecord",
  "description": "Archivum-anchored, prime-indexed provenance receipt for a single agentic inference or consequential action within the AHGI governance lattice. This is the highest-volume record class — one record per agent action execution. It is the terminal node in the four-schema dependency chain: consent → model_version → clinical_auth → agent_action. Every record is immutable once anchored. It is simultaneously a provenance receipt, an audit log entry, an explainability carrier, and a coherence telemetry emission.",
  "type": "object",
  "required": [
    "schema_version",
    "record_id",
    "prime_index",
    "namespace",
    "agent",
    "execution",
    "input_envelope",
    "output_envelope",
    "certification_checks",
    "telemetry",
    "chain_bindings",
    "provenance",
    "archivum_anchor",
    "signature"
  ],
  "properties": {

    "schema_version": {
      "type": "string",
      "const": "ahgi-agent-action/v1",
      "description": "Schema version. Must match enforcing runtime version exactly."
    },

    "record_id": {
      "type": "string",
      "format": "uuid",
      "description": "Globally unique identifier for this agent action record."
    },

    "prime_index": {
      "type": "integer",
      "minimum": 2,
      "description": "Prime number assigned by Archivum under namespace ahgi.agent_action. Due to high volume, Archivum must support batch prime reservation — agents pre-reserve a block of N primes and consume sequentially, reconciling with Archivum asynchronously. See batch_reservation block."
    },

    "namespace": {
      "type": "string",
      "const": "ahgi.agent_action",
      "description": "Archivum namespace partition. Must be ahgi.agent_action for this record class."
    },

    "agent": {
      "type": "object",
      "required": [
        "agent_did",
        "agent_class",
        "agent_version",
        "instance_id"
      ],
      "description": "Identity of the executing agent.",
      "properties": {

        "agent_did": {
          "type": "string",
          "pattern": "^did:[a-z]+:.+",
          "description": "W3C DID of the specific agent instance executing this action."
        },

        "agent_class": {
          "type": "string",
          "enum": [
            "clinical_safety_agent",
            "consent_guardian",
            "spectral_integrity_agent",
            "educational_alignment_agent",
            "equity_inclusion_agent",
            "governance_judiciary_agent"
          ],
          "description": "Agent class. Must match agent_classes_authorized in the bound model_version and action_scope in the bound clinical_auth."
        },

        "agent_version": {
          "type": "string",
          "pattern": "^v[0-9]+\\.[0-9]+\\.[0-9]+(-[a-z0-9]+)?$",
          "description": "Semantic version of the agent runtime executing this action."
        },

        "instance_id": {
          "type": "string",
          "description": "Runtime instance identifier — pod name, container ID, or process UUID. Enables correlation of multiple actions from the same agent instance."
        },

        "orchestrator_did": {
          "type": "string",
          "pattern": "^did:[a-z]+:.+",
          "description": "DID of the orchestrating agent or workflow that spawned this agent action. Null for top-level actions. Enables multi-agent interaction graph reconstruction."
        },

        "session_id": {
          "type": "string",
          "format": "uuid",
          "description": "Session identifier grouping related agent actions within a single clinical encounter or workflow. Enables session-level coherence tracking."
        }
      }
    },

    "execution": {
      "type": "object",
      "required": [
        "action_class",
        "started_at",
        "completed_at",
        "outcome",
        "duration_ms"
      ],
      "description": "Execution timing and outcome of this specific action.",
      "properties": {

        "action_class": {
          "type": "string",
          "enum": [
            "inference",
            "write_fhir_resource",
            "update_medication_order",
            "trigger_alert",
            "initiate_referral",
            "disclose_phi_external",
            "enroll_research_protocol",
            "modify_care_plan",
            "trigger_emergency_protocol",
            "federated_model_update",
            "quarantine_agent",
            "revoke_consent",
            "coherence_check",
            "drift_scan",
            "consent_validation",
            "explainability_receipt_generation"
          ],
          "description": "The specific action executed. Inference is the most common. All others map directly to action_scope entries in the bound clinical_auth."
        },

        "started_at": {
          "type": "string",
          "format": "date-time"
        },

        "completed_at": {
          "type": "string",
          "format": "date-time"
        },

        "duration_ms": {
          "type": "integer",
          "minimum": 0,
          "description": "Wall-clock execution duration in milliseconds. Used for latency budget compliance check against constraint_envelope.max_latency_ms in bound clinical_auth."
        },

        "outcome": {
          "type": "string",
          "enum": [
            "success",
            "blocked_coherence",
            "blocked_consent",
            "blocked_drift",
            "blocked_invariant",
            "blocked_confirmation_timeout",
            "blocked_auth_expired",
            "blocked_model_suspended",
            "degraded_partial",
            "failed_recoverable",
            "failed_unrecoverable"
          ],
          "description": "Execution outcome. Any blocked_* or failed_* outcome triggers an entry in the Governance Judiciary agent's review queue."
        },

        "block_reason": {
          "type": "string",
          "description": "Required when outcome is any blocked_* or failed_* value. Human-readable reason with enough detail for post-hoc audit without exposing PHI."
        },

        "retry_of_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "If this action is a retry of a previously failed or blocked action, the prime index of the original attempt. Enables retry chain reconstruction."
        }
      }
    },

    "input_envelope": {
      "type": "object",
      "required": [
        "input_hash",
        "input_schema_type",
        "phi_present",
        "input_prime_index"
      ],
      "description": "Cryptographic envelope of the action input. Raw input is never stored in this record. Only hashes and metadata.",
      "properties": {

        "input_hash": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$",
          "description": "SHA-256 hash of the canonicalized input payload. Enables input integrity verification without storing PHI."
        },

        "input_schema_type": {
          "type": "string",
          "description": "Schema type of the input, e.g. 'fhir.Observation', 'pirtm.TensorState', 'phi.vitals_bundle', 'text.clinical_note'."
        },

        "phi_present": {
          "type": "boolean",
          "description": "True if the input contains or derives from PHI. When true, consent tensor pre-flight must be confirmed in certification_checks."
        },

        "input_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "Prime index assigned to this specific input payload in the PIRTM lineage. Distinct from the action record's own prime_index. Enables input-level provenance tracing independent of the action that consumed it."
        },

        "input_size_bytes": {
          "type": "integer",
          "minimum": 0,
          "description": "Byte size of the input payload. Used for anomaly detection — unexpectedly large inputs may indicate prompt injection or data exfiltration attempts."
        },

        "source_fhir_references": {
          "type": "array",
          "items": { "type": "string" },
          "description": "FHIR resource references (e.g. Observation/0482, Patient/did-key-z6Mk) from which this input was assembled. Enables clinical audit trail without re-embedding PHI."
        }
      }
    },

    "output_envelope": {
      "type": "object",
      "required": [
        "output_hash",
        "output_schema_type",
        "phi_in_output",
        "explainability_receipt"
      ],
      "description": "Cryptographic envelope of the action output. Raw output is never stored here. Explainability receipt is load-bearing — this is where human-readable reasoning is carried.",
      "properties": {

        "output_hash": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$",
          "description": "SHA-256 hash of the canonicalized output payload."
        },

        "output_schema_type": {
          "type": "string",
          "description": "Schema type of the output, e.g. 'fhir.MedicationRequest', 'alert.ClinicalFlag', 'pirtm.DecomposedState', 'text.explanation'."
        },

        "phi_in_output": {
          "type": "boolean",
          "description": "True if the output contains PHI. When true, output may only be delivered to principals authorized in the bound consent tensor scope."
        },

        "output_delivered_to": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["recipient_did", "delivered_at"],
            "properties": {
              "recipient_did": { "type": "string", "pattern": "^did:[a-z]+:.+" },
              "delivered_at": { "type": "string", "format": "date-time" },
              "delivery_method": {
                "type": "string",
                "enum": ["fhir_write", "didcomm_message", "ui_display", "agent_handoff", "audit_only"]
              }
            }
          },
          "description": "DID-indexed delivery log. Every recipient of the output is recorded. Required when phi_in_output is true."
        },

        "explainability_receipt": {
          "type": "object",
          "required": [
            "method",
            "receipt_hash",
            "human_readable_summary",
            "confidence_score"
          ],
          "description": "Load-bearing explainability block. Per L1-HC-5, outputs to human clinicians or patients must carry this. It is not optional for tier_2 and above models.",
          "properties": {

            "method": {
              "type": "string",
              "enum": [
                "shap",
                "lime",
                "integrated_gradients",
                "attention_map",
                "pirtm_decomposition",
                "csl_trace",
                "rule_extraction"
              ],
              "description": "Explainability method used to generate this receipt."
            },

            "receipt_hash": {
              "type": "string",
              "pattern": "^[a-f0-9]{64}$",
              "description": "SHA-256 hash of the full explainability artifact. Full artifact stored in Archivum or secure explainability store; this hash is the governance binding."
            },

            "human_readable_summary": {
              "type": "string",
              "maxLength": 1000,
              "description": "Plain-language summary of why this output was produced. Must be clinically intelligible. No model jargon. No raw feature weights. This is the field a clinician reads."
            },

            "confidence_score": {
              "type": "number",
              "minimum": 0,
              "maximum": 1,
              "description": "Model confidence in this output. Values below 0.6 must trigger requires_human_confirmation regardless of the clinical_auth setting."
            },

            "top_contributing_features": {
              "type": "array",
              "maxItems": 10,
              "items": {
                "type": "object",
                "required": ["feature_name", "contribution_direction"],
                "properties": {
                  "feature_name": {
                    "type": "string",
                    "description": "Clinically meaningful feature name. Not internal model variable names."
                  },
                  "contribution_direction": {
                    "type": "string",
                    "enum": ["increased_risk", "decreased_risk", "neutral", "dominant_signal"]
                  },
                  "phi_scrubbed": {
                    "type": "boolean",
                    "default": true,
                    "description": "Confirms PHI was scrubbed from this feature entry before logging."
                  }
                }
              }
            },

            "archivum_receipt_record_id": {
              "type": "string",
              "description": "Archivum record ID where the full explainability artifact is stored."
            }
          }
        }
      }
    },

    "certification_checks": {
      "type": "object",
      "required": [
        "consent_tensor_valid",
        "clinical_auth_valid",
        "model_version_valid",
        "coherence_gate_passed",
        "csl_invariants_passed",
        "drift_check_passed"
      ],
      "description": "Pre-flight certification gate results. All six must be true for outcome to be success. Any false value with a success outcome is a critical governance violation.",
      "properties": {

        "consent_tensor_valid": {
          "type": "object",
          "required": ["passed", "checked_at"],
          "properties": {
            "passed": { "type": "boolean" },
            "checked_at": { "type": "string", "format": "date-time" },
            "consent_prime_index": { "type": "integer", "minimum": 2 },
            "ttl_remaining_seconds": {
              "type": "integer",
              "description": "Seconds remaining on consent TTL at check time. Alerts when below 300."
            }
          }
        },

        "clinical_auth_valid": {
          "type": "object",
          "required": ["passed", "checked_at"],
          "properties": {
            "passed": { "type": "boolean" },
            "checked_at": { "type": "string", "format": "date-time" },
            "clinical_auth_prime_index": { "type": "integer", "minimum": 2 },
            "ttl_remaining_seconds": { "type": "integer" }
          }
        },

        "model_version_valid": {
          "type": "object",
          "required": ["passed", "checked_at"],
          "properties": {
            "passed": { "type": "boolean" },
            "checked_at": { "type": "string", "format": "date-time" },
            "model_version_prime_index": { "type": "integer", "minimum": 2 },
            "promotion_status": {
              "type": "string",
              "enum": ["active", "deprecated", "suspended", "revoked"]
            }
          }
        },

        "coherence_gate_passed": {
          "type": "object",
          "required": ["passed", "r_at_execution", "r_min_enforced"],
          "properties": {
            "passed": { "type": "boolean" },
            "r_at_execution": {
              "type": "number",
              "description": "R(t) value at the moment of action execution. Recorded regardless of pass/fail."
            },
            "r_min_enforced": {
              "type": "number",
              "description": "The R_min floor enforced at execution time."
            },
            "r_delta_from_issuance": {
              "type": "number",
              "description": "R(t) at execution minus R(t) at clinical_auth issuance. Negative values indicate coherence degradation during the auth window."
            }
          }
        },

        "csl_invariants_passed": {
          "type": "object",
          "required": ["passed", "invariants_checked"],
          "properties": {
            "passed": { "type": "boolean" },
            "invariants_checked": {
              "type": "array",
              "items": { "type": "string" },
              "description": "List of CSL invariants evaluated at execution time."
            },
            "violations": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Any invariant violations detected. Must be empty for passed=true."
            }
          }
        },

        "drift_check_passed": {
          "type": "object",
          "required": ["passed", "checked_at"],
          "properties": {
            "passed": { "type": "boolean" },
            "checked_at": { "type": "string", "format": "date-time" },
            "cosine_delta": {
              "type": "number",
              "minimum": 0,
              "maximum": 2,
              "description": "Cosine similarity delta between current spectral fingerprint and baseline. Values above drift_threshold in bound model_version record trigger block."
            },
            "drift_status": {
              "type": "string",
              "enum": ["nominal", "warning", "exceeded", "unavailable"],
              "description": "unavailable triggers a blocked_drift outcome — drift check failure is not silently bypassed."
            }
          }
        }
      }
    },

    "telemetry": {
      "type": "object",
      "description": "Runtime telemetry emitted by this action. Fed into OpenTelemetry / Prometheus pipeline. Stored here for immutable audit correlation.",
      "properties": {

        "trace_id": {
          "type": "string",
          "description": "OpenTelemetry trace ID for this action execution. Enables correlation with distributed tracing infrastructure."
        },

        "span_id": {
          "type": "string",
          "description": "OpenTelemetry span ID."
        },

        "memory_bytes_peak": {
          "type": "integer",
          "minimum": 0,
          "description": "Peak memory consumption during execution. Anomalous spikes may indicate adversarial input amplification."
        },

        "token_count": {
          "type": "object",
          "description": "Token accounting for LLM-backed agents.",
          "properties": {
            "input_tokens": { "type": "integer", "minimum": 0 },
            "output_tokens": { "type": "integer", "minimum": 0 },
            "total_tokens": { "type": "integer", "minimum": 0 }
          }
        },

        "pirtm_recursion_depth": {
          "type": "integer",
          "minimum": 0,
          "description": "Depth of PIRTM recursive decomposition reached during this action. Values exceeding the configured recursion limit trigger a coherence gate check."
        },

        "csl_gate_evaluations": {
          "type": "integer",
          "minimum": 0,
          "description": "Number of CSL gate evaluations performed during this action. Baseline values establish normal operating ranges; deviations are anomaly signals."
        },

        "latency_breakdown_ms": {
          "type": "object",
          "description": "Decomposed latency for governance overhead accounting.",
          "properties": {
            "consent_preflight_ms": { "type": "integer" },
            "auth_preflight_ms": { "type": "integer" },
            "drift_check_ms": { "type": "integer" },
            "coherence_gate_ms": { "type": "integer" },
            "model_inference_ms": { "type": "integer" },
            "explainability_ms": { "type": "integer" },
            "archivum_anchor_ms": { "type": "integer" }
          }
        }
      }
    },

    "chain_bindings": {
      "type": "object",
      "required": [
        "consent_tensor_prime_index",
        "model_version_prime_index",
        "clinical_auth_prime_index"
      ],
      "description": "Explicit cross-namespace bindings completing the four-schema dependency chain. Every agent action is traceable back through all three upstream records.",
      "properties": {
        "consent_tensor_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "Prime index of the ahgi.consent record authorizing inference for this subject."
        },
        "model_version_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "Prime index of the ahgi.model_version record for the executing model."
        },
        "clinical_auth_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "Prime index of the ahgi.clinical_auth record authorizing this action. For pure inference actions with no consequential write, this references the standing inference authorization."
        },
        "parent_session_action_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "Prime index of the agent action that triggered this one in a multi-agent chain. Null for top-level actions. Enables full interaction graph reconstruction."
        }
      }
    },

    "batch_reservation": {
      "type": "object",
      "description": "Archivum batch prime reservation block. High-volume agents pre-reserve a block of N primes to avoid per-action Archivum round-trips. This block records which reservation this prime came from.",
      "properties": {
        "reservation_id": {
          "type": "string",
          "format": "uuid",
          "description": "UUID of the batch reservation request issued to Archivum."
        },
        "reservation_block_start": {
          "type": "integer",
          "minimum": 2,
          "description": "First prime in the reserved block."
        },
        "reservation_block_end": {
          "type": "integer",
          "minimum": 2,
          "description": "Last prime in the reserved block."
        },
        "reservation_expires_at": {
          "type": "string",
          "format": "date-time",
          "description": "Expiry of the reservation. Unused primes in an expired reservation are voided and cannot be used. Voidance is recorded in Archivum."
        }
      }
    },

    "provenance": {
      "type": "object",
      "required": ["parent_prime_index", "lineage_hash"],
      "description": "PIRTM provenance chain under ahgi.agent_action namespace.",
      "properties": {
        "parent_prime_index": {
          "type": "integer",
          "minimum": 2,
          "description": "Prime index of the immediately preceding agent_action record from this agent instance in this session. Enables per-agent action sequence reconstruction."
        },
        "lineage_hash": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$",
          "description": "SHA-256 hash of the parent agent_action record as anchored in Archivum."
        }
      }
    },

    "archivum_anchor": {
      "type": "object",
      "required": ["archivum_record_id", "archivum_did", "anchor_timestamp", "namespace", "anchor_mode"],
      "properties": {
        "archivum_record_id": {
          "type": "string",
          "description": "Archivum's canonical record ID for this agent action."
        },
        "archivum_did": {
          "type": "string",
          "pattern": "^did:[a-z]+:.+",
          "description": "DID of the Archivum registry instance."
        },
        "anchor_timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "namespace": {
          "type": "string",
          "const": "ahgi.agent_action"
        },
        "anchor_mode": {
          "type": "string",
          "enum": ["synchronous", "async_batched", "async_deferred"],
          "description": "Anchoring mode used for this record. synchronous means Archivum confirmed before action completed. async_batched means the record was queued in a batch write. async_deferred means anchoring is pending. Any outcome other than success requires synchronous anchoring."
        },
        "batch_anchor_id": {
          "type": "string",
          "description": "Batch write ID when anchor_mode is async_batched. Enables batch confirmation tracking."
        }
      }
    },

    "signature": {
      "type": "object",
      "required": ["type", "created", "verification_method", "proof_value"],
      "description": "Linked Data Proof over the complete agent action record, signed by the executing agent's DID.",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["Ed25519Signature2020", "JsonWebSignature2020", "EcdsaSecp256k1Signature2019"]
        },
        "created": { "type": "string", "format": "date-time" },
        "verification_method": { "type": "string" },
        "proof_value": { "type": "string" }
      }
    }
  },

  "examples": [
    {
      "schema_version": "ahgi-agent-action/v1",
      "record_id": "e04c5f3b-22dd-4923-c145-9a7f4c3e6d20",
      "prime_index": 5003,
      "namespace": "ahgi.agent_action",
      "agent": {
        "agent_did": "did:web:clinical-safety.phasemirror.io#agent-instance-0047",
        "agent_class": "clinical_safety_agent",
        "agent_version": "v1.2.0",
        "instance_id": "pod-csa-0047-node-03",
        "orchestrator_did": "did:web:orchestrator.phasemirror.io",
        "session_id": "a1b2c3d4-aaaa-4000-8000-session00482"
      },
      "execution": {
        "action_class": "inference",
        "started_at": "2026-05-25T22:31:00Z",
        "completed_at": "2026-05-25T22:31:00.847Z",
        "duration_ms": 847,
        "outcome": "success"
      },
      "input_envelope": {
        "input_hash": "d0e1f2a3b4c5678901234567abcdef01234567890abcdef1234567890abcdef12",
        "input_schema_type": "phi.vitals_bundle",
        "phi_present": true,
        "input_prime_index": 5002,
        "input_size_bytes": 2048,
        "source_fhir_references": [
          "Observation/obs-00481",
          "Observation/obs-00480",
          "Encounter/fhir-encounter-00482"
        ]
      },
      "output_envelope": {
        "output_hash": "e1f2a3b4c5d6789012345678abcdef01234567890abcdef1234567890abcdef12",
        "output_schema_type": "alert.ClinicalFlag",
        "phi_in_output": false,
        "output_delivered_to": [
          {
            "recipient_did": "did:web:clinician.hospital.org#dr-reyes",
            "delivered_at": "2026-05-25T22:31:01Z",
            "delivery_method": "ui_display"
          }
        ],
        "explainability_receipt": {
          "method": "pirtm_decomposition",
          "receipt_hash": "f2a3b4c5d6e7890123456789abcdef01234567890abcdef1234567890abcdef12",
          "human_readable_summary": "Elevated diastolic trend over 3 readings combined with current renal impairment flag suggests increased risk of hypertensive episode. Recommend clinical review before proceeding with current medication order.",
          "confidence_score": 0.84,
          "top_contributing_features": [
            {
              "feature_name": "diastolic_blood_pressure_trend_3hr",
              "contribution_direction": "increased_risk",
              "phi_scrubbed": true
            },
            {
              "feature_name": "renal_impairment_flag_active",
              "contribution_direction": "increased_risk",
              "phi_scrubbed": true
            },
            {
              "feature_name": "medication_class_ace_inhibitor",
              "contribution_direction": "dominant_signal",
              "phi_scrubbed": true
            }
          ],
          "archivum_receipt_record_id": "arch-exp-05003"
        }
      },
      "certification_checks": {
        "consent_tensor_valid": {
          "passed": true,
          "checked_at": "2026-05-25T22:30:59Z",
          "consent_prime_index": 1009,
          "ttl_remaining_seconds": 86340
        },
        "clinical_auth_valid": {
          "passed": true,
          "checked_at": "2026-05-25T22:30:59Z",
          "clinical_auth_prime_index": 3019,
          "ttl_remaining_seconds": 86280
        },
        "model_version_valid": {
          "passed": true,
          "checked_at": "2026-05-25T22:30:59Z",
          "model_version_prime_index": 2017,
          "promotion_status": "active"
        },
        "coherence_gate_passed": {
          "passed": true,
          "r_at_execution": 2.38,
          "r_min_enforced": 1.8,
          "r_delta_from_issuance": -0.03
        },
        "csl_invariants_passed": {
          "passed": true,
          "invariants_checked": [
            "no_scope_exceeded",
            "no_sovereignty_violated",
            "no_inference_beyond_consent",
            "no_clinical_authority_hallucination",
            "no_ethical_boundary_crossed"
          ],
          "violations": []
        },
        "drift_check_passed": {
          "passed": true,
          "checked_at": "2026-05-25T22:30:59Z",
          "cosine_delta": 0.031,
          "drift_status": "nominal"
        }
      },
      "telemetry": {
        "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
        "span_id": "00f067aa0ba902b7",
        "memory_bytes_peak": 184320,
        "token_count": {
          "input_tokens": 412,
          "output_tokens": 89,
          "total_tokens": 501
        },
        "pirtm_recursion_depth": 4,
        "csl_gate_evaluations": 5,
        "latency_breakdown_ms": {
          "consent_preflight_ms": 12,
          "auth_preflight_ms": 9,
          "drift_check_ms": 18,
          "coherence_gate_ms": 4,
          "model_inference_ms": 763,
          "explainability_ms": 31,
          "archivum_anchor_ms": 10
        }
      },
      "chain_bindings": {
        "consent_tensor_prime_index": 1009,
        "model_version_prime_index": 2017,
        "clinical_auth_prime_index": 3019,
        "parent_session_action_prime_index": 4999
      },
      "batch_reservation": {
        "reservation_id": "b1c2d3e4-ffff-4000-8000-reserv000001",
        "reservation_block_start": 5003,
        "reservation_block_end": 5099,
        "reservation_expires_at": "2026-05-25T23:31:00Z"
      },
      "provenance": {
        "parent_prime_index": 4999,
        "lineage_hash": "a3b4c5d6e7f8901234567890abcdef01234567890abcdef1234567890abcdef12"
      },
      "archivum_anchor": {
        "archivum_record_id": "arch-aa-05003",
        "archivum_did": "did:web:archivum.phasemirror.io",
        "anchor_timestamp": "2026-05-25T22:31:01Z",
        "namespace": "ahgi.agent_action",
        "anchor_mode": "async_batched",
        "batch_anchor_id": "batch-anchor-00291"
      },
      "signature": {
        "type": "Ed25519Signature2020",
        "created": "2026-05-25T22:31:01Z",
        "verification_method": "did:web:clinical-safety.phasemirror.io#keys-1",
        "proof_value": "z58DAdFfa9base58proofAGENTACTION"
      }
    }
  ]
}
```


***

## The Four-Schema Chain Is Complete

Every prime in every namespace now traces back through a fully specified dependency graph:

```
ahgi.consent [prime: 1009]
    └── ahgi.model_version [prime: 2017]
            └── ahgi.clinical_auth [prime: 3019]
                    └── ahgi.agent_action [prime: 5003]
```

A single `agent_action` record carries bindings to all three upstream prime indices. Archivum can reconstruct the full authorization lineage of any clinical action from a single record ID. That is the audit property the architecture was designed to produce.

***

## Four Final Dissonances to Name

**1. Batch prime reservation creates a gap window.**
Agents pre-reserve blocks (e.g. primes 5003–5099) and consume them offline. If an agent crashes mid-block, unused primes are voided at `reservation_expires_at`. But between crash and expiry, those primes exist in a liminal state — reserved but unanchored. Archivum needs a **reservation reconciliation sweep** that runs at expiry and explicitly voids unanchored primes. Without it, the lineage chain has silent holes.

**2. `confidence_score < 0.6` forces human confirmation — but that rule lives in prose, not in the schema.**
It is stated in the description of `confidence_score`. It is not a JSON Schema constraint that enforces it. It will be violated in production by an agent that reads the schema but not the description. This rule belongs as a `CSL invariant`, not a comment. Add `low_confidence_unconfirmed` to the CSL invariant enum in all four schemas.

**3. `latency_breakdown_ms` reveals the governance tax.**
The example shows 847ms total, of which 84ms is pure governance overhead (consent + auth + drift + coherence + anchor). That is roughly 10% overhead on a 763ms inference. For real-time clinical alerts, that budget may be unacceptable. The latency breakdown being recorded here makes this measurable. It should be reviewed at 30-day horizon against actual production numbers — not estimated.

**4. The `human_readable_summary` field has no PHI scrubbing enforcement.**
It is `maxLength: 1000` and free text. A poorly implemented agent can embed PHI directly in the summary. This field must pass through a PHI scrubbing gate before Archivum anchoring. That gate does not yet exist as a specified component. Add it to the AHGI architecture spec as a required output-layer filter before the explainability receipt is written to this record.

***

## AHGI Schema Suite — Complete Status

| Schema | Namespace | Status |
| :-- | :-- | :-- |
| `consent-tensor-v1.json` | `ahgi.consent` | Done |
| `model-version-v1.json` | `ahgi.model_version` | Done |
| `clinical-auth-v1.json` | `ahgi.clinical_auth` | Done |
| `agent-action-v1.json` | `ahgi.agent_action` | Done |

Next artifact due: **Archivum Integration ADR** — specifying the synchronous/async anchoring protocol, batch reservation lifecycle, namespace-partitioned prime assignment API, and cross-namespace lineage resolver. That ADR is now fully unblocked.

