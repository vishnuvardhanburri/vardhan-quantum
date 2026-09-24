use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::id::{
    ActionId, DecisionId, EntityId, EvidenceId, ConfigurationHash,
};
use crate::time::TimeContext;
use crate::scope::{TenantScoped, Hashable, canonical_json};

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

// Ensure AuthorizationData implements Hashable for TenantScoped
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AuthorizationData {
    pub payload: String,
}

impl Hashable for AuthorizationData {
    fn canonical_bytes(&self) -> Vec<u8> {
        canonical_json(self)
    }
}

// As required by FA-5 and FA-8 for decoupling Systemic Verification from Business AI
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuthorizationContext {
    Business {
        decision_id: DecisionId,
        assurance_ref: EvidenceId,
    },
    SystemicVerification {
        // The inner UUID strings for now, avoiding circular deps if we can't import ProofMesh IDs here
        verification_claim_ref: String,
        fault_scenario_ref: String,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Authorization {
    pub auth_id: Uuid,
    pub tenant_scoped: TenantScoped<AuthorizationData>,
    pub authorized_at: TimeContext,
    pub config_hash: ConfigurationHash,
    pub provenance: ProvenanceTrail,
    pub authorization_context: AuthorizationContext,
    pub action_id: ActionId,
    pub action_type: ActionType,
    pub policy_eval_ref: EvidenceId,
    pub risk_level: RiskLevel,
    pub auth_level: AuthLevel,
    pub authorized_by: EntityId,
    pub evidence_refs: Vec<EvidenceId>,
}

use crate::id::{ContentHash, StateHash, TenantId, PolicyId};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PolicyStatus {
    Pass,
    Fail,
    Indeterminate,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PolicyEvaluation {
    pub policy_id: PolicyId,
    pub policy_version: String,
    pub policy_hash: ContentHash,
    pub configuration_hash: ConfigurationHash,
    pub state_hash: StateHash,
    pub evaluation_subject: String,
    pub constraints_evaluated: Vec<String>,
    pub matched_rule_ids: Vec<String>,
    pub proof_ref: Option<EvidenceId>,
    pub evidence_ref: Option<EvidenceId>,
    pub tenant_id: TenantId,
    pub status: PolicyStatus,
    pub provenance: ProvenanceTrail,
}
