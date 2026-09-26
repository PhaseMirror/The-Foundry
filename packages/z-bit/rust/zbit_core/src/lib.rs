//! Core library for Z‑Bit — pure Rust implementation with Kani proofs.
//! Replaces the previous Python CCRE logic and Lean/mathlib dependency.

pub mod constants;
pub mod contraction;
pub mod drift_tracker;
pub mod pilot;
pub mod resonance_guard;
pub mod updater;
pub mod witness;
pub mod kani_proofs;
