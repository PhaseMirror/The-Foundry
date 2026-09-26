use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum FundingDoor {
    Gift,
    SponsorDues,
    RecoverableGrant,
    OperatorRemittance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricCard {
    pub member_dignity_pass: bool,
    pub community_outcome_pass: bool,
    pub solvency_pass: bool,
}

impl MetricCard {
    pub fn is_pass(&self) -> bool {
        self.member_dignity_pass && self.community_outcome_pass && self.solvency_pass
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LivermoreEnvelope {
    pub acquisition_spent: u64,
    pub phase1_kit_spent: u64,
    pub consecutive_failed_quarters: u32,
    pub title_holder: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Disbursement {
    pub amount: u64,
    pub signatures: usize,
    pub is_acquisition: bool,
    pub is_phase1_kit: bool,
    pub source_door: Option<FundingDoor>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum EnvelopeError {
    AcquisitionCeilingExceeded,
    Phase1KitCeilingExceeded,
    Phase2BarnExcluded,
    DualControlRequired,
    InvalidTitleHolder,
    InvalidFundingDoor,
    KillSwitchEngaged,
}

impl LivermoreEnvelope {
    pub fn new() -> Self {
        Self {
            acquisition_spent: 0,
            phase1_kit_spent: 0,
            consecutive_failed_quarters: 0,
            title_holder: "Citizen Gardens UNA".to_string(),
        }
    }

    pub fn process_disbursement(&mut self, req: &Disbursement) -> Result<(), EnvelopeError> {
        if self.consecutive_failed_quarters >= 2 {
            return Err(EnvelopeError::KillSwitchEngaged);
        }

        if self.title_holder != "Citizen Gardens UNA" {
            return Err(EnvelopeError::InvalidTitleHolder);
        }

        if req.amount > 2500 && req.signatures < 2 {
            return Err(EnvelopeError::DualControlRequired);
        }

        if req.source_door.is_none() {
            return Err(EnvelopeError::InvalidFundingDoor);
        }

        if req.is_acquisition {
            if self.acquisition_spent + req.amount > 800_000 {
                return Err(EnvelopeError::AcquisitionCeilingExceeded);
            }
            self.acquisition_spent += req.amount;
        } else if req.is_phase1_kit {
            if self.phase1_kit_spent + req.amount > 200_000 {
                return Err(EnvelopeError::Phase1KitCeilingExceeded);
            }
            self.phase1_kit_spent += req.amount;
        } else {
            // Phase 2 barn excluded, or other non-authorized disbursements
            return Err(EnvelopeError::Phase2BarnExcluded);
        }

        Ok(())
    }

    pub fn submit_metric_card(&mut self, card: &MetricCard) {
        if card.is_pass() {
            self.consecutive_failed_quarters = 0;
        } else {
            self.consecutive_failed_quarters += 1;
        }
    }
}
