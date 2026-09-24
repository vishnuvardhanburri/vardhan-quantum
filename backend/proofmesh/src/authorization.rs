use serde::{Deserialize, Serialize};
use uuid::Uuid;

use vardhan_state::id::{
    ActionId, DecisionId, EntityId, EvidenceId, ConfigurationHash,
};
use vardhan_state::time::TimeContext;
use vardhan_state::scope::TenantScoped;

use crate::identity::{VerificationClaimId, FaultScenarioId};

// We will assume ProvenanceTrail comes from a common location or redefine it if needed.
// For now, we'll redefine the minimum needed for canonical ProofMesh usage.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProvenanceTrail {
    pub generator_model: String,
    pub generation_timestamp: u64,
    pub context_hash: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ActionType {
    Read,
    Modify,
    Create,
    Delete,
    Execute,
    SystemicFaultInjection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AuthLevel {
    Standard,
    Elevated,
    Systemic,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuthorizationContext {
    Business {
        decision_id: DecisionId,
        assurance_ref: EvidenceId,
    },
    SystemicVerification {
        verification_claim_ref: VerificationClaimId,
        fault_scenario_ref: FaultScenarioId,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AuthorizationData {
    // Arbitrary internal data for the tenant scope.
    pub payload: String,
}

// Ensure AuthorizationData implements Hashable for TenantScoped
use vardhan_state::scope::{Hashable, canonical_json};
impl Hashable for AuthorizationData {
    fn canonical_bytes(&self) -> Vec<u8> {
        canonical_json(self)
    }
}

/// Fully reconciled Authorization object (FA-5)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Authorization {
    pub auth_id: Uuid,
    pub tenant_scoped: TenantScoped<AuthorizationData>,
    pub authorized_at: TimeContext,
    pub config_hash: ConfigurationHash,
    pub provenance: ProvenanceTrail,
    
    // -- NEW FIELD --
    pub authorization_context: AuthorizationContext, 
    
    // -- RETAINED FIELDS --
    pub action_id: ActionId,
    pub action_type: ActionType,
    pub policy_eval_ref: EvidenceId,
    pub risk_level: RiskLevel,
    pub auth_level: AuthLevel,
    pub authorized_by: EntityId,
    pub evidence_refs: Vec<EvidenceId>,
}
