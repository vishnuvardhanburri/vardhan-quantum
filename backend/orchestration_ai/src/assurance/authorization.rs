use serde::{Deserialize, Serialize};
use super::types::{ConfigurationHash, TenantId};
use super::contracts::AssuranceStatus;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PolicyEvaluation {
    pub policy_id: String,
    pub policy_version: String,
    pub configuration_hash: ConfigurationHash,
    pub constraints_evaluated: Vec<String>,
    pub matched_rule_ids: Vec<String>,
    pub proof_ref: Option<String>,
    pub status: AssuranceStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidityWindow {
    pub not_before: u64,
    pub not_after: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Authorization {
    pub authorization_id: String,
    pub decision_twin_id: String,
    pub candidate_id: String,
    pub security_ir_hash: String, // Content Hash
    pub assurance_result_id: String,
    pub policy_evaluation_id: String,
    pub configuration_hash: ConfigurationHash,
    pub tenant_id: TenantId,
    pub validity_window: ValidityWindow,
    pub evidence_ref: String,
}
