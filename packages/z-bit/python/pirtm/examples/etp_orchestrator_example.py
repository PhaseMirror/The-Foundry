#!/usr/bin/env python3
"""
ETP Orchestrator Example

This script demonstrates the stable public API for the ETP orchestrator,
showing how to initialize the system, run a certification, and process
the resulting witness.
"""

from pirtm import ace, governance, petc

def run_etp_orchestrator_example():
    """
    A small structural orchestrator example demonstrating the stable
    public API for the ETP (Entangled Taylor-series Process) workflow.
    """
    print("---")
    print("Running ETP Orchestrator Example")
    print("---")

    # 1. Initialize the ACE protocol
    # The ACE protocol is the core certification engine.
    ace_protocol = ace.AceProtocol(tau=1.0, delta=0.05)
    print(f"✅ ACE protocol initialized with budget: {ace_protocol.budget_state()}")

    # 2. Create mock telemetry data
    # In a real scenario, this data would come from a running system.
    telemetry_records = [
        ace.StepInfo(epsilon=0.1, q=0.85),
        ace.StepInfo(epsilon=0.08, q=0.82),
    ]
    print(f"✅ Created mock telemetry with {len(telemetry_records)} records.")

    # 3. Run certification
    # The ACE protocol certifies the telemetry, producing a witness.
    witness = ace_protocol.certify_from_telemetry(telemetry_records, prime_index=2)
    print(f"✅ Certification complete. Witness ID: {witness.witness_id}")

    # 4. Process the witness with the PETC chain
    # The PETC (Prime-Entangled Taylor Chain) consumes the witness to produce
    # a Merkle-ready chain for Jubilee checkpointing.
    chain = petc.chain.Chain()
    chain.consume_witness(witness)
    print(f"✅ Witness consumed by PETC chain. Chain length: {len(chain.links)}")

    # 5. (Simulated) Governance action
    # The governance module can now use the verified information to take action.
    # For this example, we'll just register the witness badge.
    badge_registry = governance.badge_registry.BadgeRegistry()
    badge_registry.register_badge(witness.witness_id, "etp_certification")
    print(f"✅ Witness badge registered in governance registry.")
    print("---")

if __name__ == "__main__":
    run_etp_orchestrator_example()
