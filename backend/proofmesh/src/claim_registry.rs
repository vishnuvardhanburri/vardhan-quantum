use serde::{Deserialize, Serialize};
use vardhan_state::id::{TenantId, ContentHash, StateHash};
use vardhan_state::time::TimeContext;
use crate::identity::{VerificationClaimId, CanonicalObjectRef};
use crate::authorization::ProvenanceTrail;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ClaimStatus {
    Created,
    Validated,
    EvidenceGathering,
    QuorumReady,
    Certified,
    Rejected,
    Indeterminate,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VerificationClaim {
    pub claim_id: VerificationClaimId,
    pub tenant_id: TenantId,
    pub claim_type: String,
    pub target_ref: CanonicalObjectRef,
    pub required_evidence_classes: Vec<String>,
    pub independence_requirements: Vec<String>,
    pub policy_ref: String,
    pub config_hash: ContentHash,
    pub state_hash: StateHash,
    pub provenance: ProvenanceTrail,
    pub time_context: TimeContext,
    pub status: ClaimStatus,
}

impl VerificationClaim {
    pub fn new(
        claim_id: VerificationClaimId,
        tenant_id: TenantId,
        claim_type: String,
        target_ref: CanonicalObjectRef,
        policy_ref: String,
        config_hash: ContentHash,
        state_hash: StateHash,
        provenance: ProvenanceTrail,
        time_context: TimeContext,
    ) -> Self {
        Self {
            claim_id,
            tenant_id,
            claim_type,
            target_ref,
            required_evidence_classes: Vec::new(),
            independence_requirements: Vec::new(),
            policy_ref,
            config_hash,
            state_hash,
            provenance,
            time_context,
            status: ClaimStatus::Created,
        }
    }

    pub fn transition_to(&mut self, new_status: ClaimStatus) -> Result<(), &'static str> {
        match (self.status, new_status) {
            (ClaimStatus::Created, ClaimStatus::Validated) => {
                self.status = new_status;
                Ok(())
            },
            (ClaimStatus::Validated, ClaimStatus::EvidenceGathering) => {
                self.status = new_status;
                Ok(())
            },
            (ClaimStatus::EvidenceGathering, ClaimStatus::QuorumReady) => {
                self.status = new_status;
                Ok(())
            },
            (ClaimStatus::QuorumReady, ClaimStatus::Certified) 
            | (ClaimStatus::QuorumReady, ClaimStatus::Rejected) 
            | (ClaimStatus::QuorumReady, ClaimStatus::Indeterminate) => {
                self.status = new_status;
                Ok(())
            },
            _ => Err("Invalid lifecycle transition"),
        }
    }
}
