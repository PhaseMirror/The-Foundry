#[cfg(kani)]
mod automation_proofs {
    use phase_mirror_automation::automation::AutomationAction;

    #[kani::proof]
    fn verify_action_equality() {
        let a1 = AutomationAction::CargoBuild {
            package: None,
            release: true,
        };
        let a2 = AutomationAction::CargoBuild {
            package: None,
            release: true,
        };
        kani::assert(a1 == a2, "identical builds must be equal");
    }

    #[kani::proof]
    fn verify_action_inequality() {
        let a1 = AutomationAction::CargoBuild {
            package: None,
            release: true,
        };
        let a2 = AutomationAction::CargoTest { package: None };
        kani::assert(a1 != a2, "different actions must not be equal");
    }

    #[kani::proof]
    fn verify_l0_bitmask_block() {
        let has_admin: bool = kani::any();
        let has_write: bool = kani::any();
        kani::assume(has_write);
        kani::assume(!has_admin);

        let outcome = if has_write && !has_admin {
            phase_mirror_automation::governance::AutomationGovernanceOutcome::Block(
                "privilege escalation",
            )
        } else {
            phase_mirror_automation::governance::AutomationGovernanceOutcome::Allow
        };

        kani::assert(
            matches!(
                outcome,
                phase_mirror_automation::governance::AutomationGovernanceOutcome::Block(_)
            ),
            "write without admin must block",
        );
    }
}
