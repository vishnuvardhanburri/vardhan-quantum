use serde::{Deserialize, Serialize};
use std::sync::Arc;
use vardhan_state::id::{ContentHash, StateHash};
use vardhan_state::time::TimeContext;
use crate::identity::{VerificationClaimId, CanonicalObjectRef};
use vardhan_state::authorization::ProvenanceTrail;
use vardhan_state::scope::TenantScoped;
use vardhan_state::store::StateStore;
use vardhan_state::id::TenantId;

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
            (ClaimStatus::Created, ClaimStatus::Validated) |
            (ClaimStatus::Created, ClaimStatus::Rejected) => {
                self.status = new_status;
                Ok(())
            },
            (ClaimStatus::Validated, ClaimStatus::EvidenceGathering) |
            (ClaimStatus::Validated, ClaimStatus::Rejected) => {
                self.status = new_status;
                Ok(())
            },
            (ClaimStatus::EvidenceGathering, ClaimStatus::QuorumReady) |
            (ClaimStatus::EvidenceGathering, ClaimStatus::Indeterminate) => {
                self.status = new_status;
                Ok(())
            },
            (ClaimStatus::QuorumReady, ClaimStatus::Certified) |
            (ClaimStatus::QuorumReady, ClaimStatus::Rejected) |
            (ClaimStatus::QuorumReady, ClaimStatus::Indeterminate) => {
                self.status = new_status;
                Ok(())
            },
            _ => Err("Invalid lifecycle transition"),
        }
    }
}

pub struct ClaimRegistry<S: StateStore> {
    pub state_store: Arc<S>,
}

impl<S: StateStore> ClaimRegistry<S> {
    pub fn new(state_store: Arc<S>) -> Self {
        Self { state_store }
    }

    pub fn register_claim(&self, tenant_id: TenantId, claim: VerificationClaim) -> Result<TenantScoped<VerificationClaim>, &'static str> {
        // Enforce tenant scoping boundary (Phase 4 & 6)
        let scoped_claim = TenantScoped::new(tenant_id, claim);
        
        // In a full implementation, we'd wrap this in a StateTransitionRecord and call self.state_store.apply(...)
        // but since we're just modeling the subsystem interface:
        Ok(scoped_claim)
    }

    pub fn advance_claim(&self, scoped_claim: &mut TenantScoped<VerificationClaim>, new_status: ClaimStatus) -> Result<(), &'static str> {
        let mut inner = scoped_claim.inner().clone();
        inner.transition_to(new_status)?;
        *scoped_claim = scoped_claim.rewrap(inner);
        // Persist the transition via existing state store...
        Ok(())
    }
}
