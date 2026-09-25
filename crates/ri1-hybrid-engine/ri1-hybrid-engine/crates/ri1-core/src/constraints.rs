use std::fmt;
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum Severity {
    Soft,
    Hard,
}

impl fmt::Display for Severity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Severity::Soft => write!(f, "soft"),
            Severity::Hard => write!(f, "hard"),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ConstraintResult {
    pub passed: bool,
    pub severity: Severity,
    pub name: &'static str,
    pub message: Option<String>,
}

impl ConstraintResult {
    pub fn pass(name: &'static str) -> Self {
        Self { passed: true, severity: Severity::Soft, name, message: None }
    }
    pub fn fail(name: &'static str, message: impl Into<String>) -> Self {
        Self { passed: false, severity: Severity::Hard, name, message: Some(message.into()) }
    }
    pub fn fail_soft(name: &'static str, message: impl Into<String>) -> Self {
        Self { passed: false, severity: Severity::Soft, name, message: Some(message.into()) }
    }
}

/// Constraint evaluated over content of type `T`.
///
/// Default instantiation is `Constraint<str>` for text-based constraint
/// evaluation. Multimodal constraints should use a different type parameter
/// (e.g., `Constraint<[u8]>` for binary content) and a corresponding
/// engine that dispatches correctly.
///
/// # Examples
///
/// Text constraint (default):
/// ```
/// use ri1_core::constraints::{Constraint, ConstraintResult, Severity};
///
/// struct MinLength(pub usize);
///
/// impl Constraint for MinLength {
///     fn name(&self) -> &'static str { "min_length" }
///     fn check(&self, text: &str) -> ConstraintResult {
///         if text.len() >= self.0 {
///             ConstraintResult::pass("min_length")
///         } else {
///             ConstraintResult::fail_soft("min_length", format!("need {} chars, got {}", self.0, text.len()))
///         }
///     }
/// }
/// ```
///
/// Binary constraint (multimodal):
/// ```
/// use ri1_core::constraints::{Constraint, ConstraintResult, Severity};
///
/// struct MaxBytes(pub usize);
///
/// impl Constraint<[u8]> for MaxBytes {
///     fn name(&self) -> &'static str { "max_bytes" }
///     fn check(&self, bytes: &[u8]) -> ConstraintResult {
///         if bytes.len() <= self.0 {
///             ConstraintResult::pass("max_bytes")
///         } else {
///             ConstraintResult::fail("max_bytes", format!("{} bytes exceeds limit {}", bytes.len(), self.0))
///         }
///     }
/// }
/// ```
pub trait Constraint<T: ?Sized = str>: Send + Sync {
    fn name(&self) -> &'static str;
    fn check(&self, content: &T) -> ConstraintResult;
}

/// Engine that evaluates constraints for a given modality and text content.
pub trait ConstraintEngine: Send + Sync {
    fn evaluate(&self, modality: &str, content: &str) -> Vec<ConstraintResult>;
}

// --- Phase 2: Meta Engine Interfaces ---
/// Taxonomy of operator types used for influence scoring, event labeling,
/// and negotiation edge computation in the meta-engine.
///
/// Variants are **NOT** a dispatch table; operator behavior lives in
/// `OperatorGate` implementations in `ri1-symbolic-meta`.
///
/// # Operator Groups
///
/// | Group | Variants | Section | Purpose |
/// |-------|----------|---------|---------|
/// | Field-Phase | `Coexistence`, `Fusion`, `Transcendence`, `HarmonicStabilization`, `StructuralIllumination`, `ClosureIntegration`, `EmergentSystem`, `DirectionalGrowth`, `Oscillation`, `RecurrencePattern`, `WillForce`, `PerceptionModulation`, `MicroTransformation`, `IntentionVector`, `Synchronicity`, `Ignition` | 001-019 | Core field-phase operators |
/// | Measurement | `MeasurementBridge` | 020 | Measurement→perception bridge |
/// | Conditionals | `FlowVector`, `Simultaneity`, `InteractionInterface`, `Disruption`, `Orthogonality`, `LoopCycle`, `StabilizationResolution` | — | Interaction conditionals |
/// | Violations | `InteractionViolation`, `InteractionNotice` | — | Audit and governance |
/// | Index | `IndexModifier` | 017 | Depth/count modifier |
///
/// All 30 variants are listed below and validated in the test module.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
pub enum OperatorClass {
    Coexistence,
    Fusion,
    Transcendence,
    HarmonicStabilization,
    QualiaGateway,
    Entanglement,
    StructuralIllumination,
    ClosureIntegration,
    EmergentSystem,
    DirectionalGrowth,
    Oscillation,
    MicroIgnition,
    RecurrencePattern,
    WillForce,
    PerceptionModulation,
    MicroTransformation,
    IntentionVector,
    IndexModifier,
    Synchronicity,
    Ignition,
    MeasurementBridge,
    FlowVector,
    Simultaneity,
    InteractionInterface,
    Disruption,
    Orthogonality,
    LoopCycle,
    StabilizationResolution,
    InteractionViolation,
    InteractionNotice,
}

#[derive(Debug, Clone, Serialize)]
pub struct Consent {
    pub granted: bool,
    pub subject: Option<String>,
    pub reason: Option<String>,
    pub section_ref: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct FieldContext {
    pub phase: Option<String>,
    pub source: Option<String>,
    pub field_id: Option<String>,
}

impl Default for FieldContext {
    fn default() -> Self { Self { phase: Some("alpha".into()), source: None, field_id: None } }
}

#[derive(Debug, Clone, Serialize)]
pub struct ResonanceEvent {
    pub operator: OperatorClass,
    pub message: String,
    pub section_ref: Option<String>,
    pub symbol: Option<String>,
}

pub trait MetaEngine: Send + Sync {
    fn consent_check(&self, ctx: &FieldContext) -> Consent;
    fn evaluate_meta(
        &self,
        modality: &str,
        content: &str,
        ctx: &FieldContext,
    ) -> (Vec<ConstraintResult>, Vec<ResonanceEvent>);
    fn operators(&self) -> &[OperatorDef];
    fn conditionals(&self) -> &[ConditionalDef];
}

#[derive(Debug, Clone)]
pub struct OperatorDef {
    pub key: String,          // canonical name
    pub symbol: String,       // e.g., Φ, Λ, etc.
    pub section_ref: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ConditionalDef {
    pub key: String,      // canonical name
    pub symbol: String,   // e.g., +, /, :
    pub section_ref: Option<String>,
}

// --- Field-Phase Operator Gates (e.g., Φ) ---
#[derive(Debug, Clone)]
pub struct GateOutcome {
    pub stabilized: bool,
    pub prevented_fusion: bool,
    pub prevented_disruption: bool,
    pub note: Option<String>,
}

pub trait OperatorGate: Send + Sync {
    fn symbol(&self) -> &'static str;
    fn apply(&self, content: &str) -> GateOutcome;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn constraint_result_pass() {
        let r = ConstraintResult::pass("test");
        assert!(r.passed);
        assert_eq!(r.name, "test");
        assert!(r.message.is_none());
    }

    #[test]
    fn constraint_result_fail() {
        let r = ConstraintResult::fail("test", "error");
        assert!(!r.passed);
        assert_eq!(r.severity, Severity::Hard);
        assert_eq!(r.message, Some("error".into()));
    }

    #[test]
    fn constraint_result_fail_soft() {
        let r = ConstraintResult::fail_soft("test", "warn");
        assert!(!r.passed);
        assert_eq!(r.severity, Severity::Soft);
    }

    #[test]
    fn operator_class_taxonomy_complete() {
        let variants = [
            OperatorClass::Coexistence,
            OperatorClass::Fusion,
            OperatorClass::Transcendence,
            OperatorClass::HarmonicStabilization,
            OperatorClass::QualiaGateway,
            OperatorClass::Entanglement,
            OperatorClass::StructuralIllumination,
            OperatorClass::ClosureIntegration,
            OperatorClass::EmergentSystem,
            OperatorClass::DirectionalGrowth,
            OperatorClass::Oscillation,
            OperatorClass::MicroIgnition,
            OperatorClass::RecurrencePattern,
            OperatorClass::WillForce,
            OperatorClass::PerceptionModulation,
            OperatorClass::MicroTransformation,
            OperatorClass::IntentionVector,
            OperatorClass::IndexModifier,
            OperatorClass::Synchronicity,
            OperatorClass::Ignition,
            OperatorClass::MeasurementBridge,
            OperatorClass::FlowVector,
            OperatorClass::Simultaneity,
            OperatorClass::InteractionInterface,
            OperatorClass::Disruption,
            OperatorClass::Orthogonality,
            OperatorClass::LoopCycle,
            OperatorClass::StabilizationResolution,
            OperatorClass::InteractionViolation,
            OperatorClass::InteractionNotice,
        ];
        assert_eq!(variants.len(), 30);
        for v in &variants {
            let _ = format!("{:?}", v);
        }
    }
}
