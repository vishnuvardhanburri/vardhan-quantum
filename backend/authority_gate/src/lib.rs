use serde::{Deserialize, Serialize};
use tracing::{error, info};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ActionStatus {
    Pass,
    Fail,
    Indeterminate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorizationEvidence {
    pub authorization_id: String,
    pub final_status: ActionStatus,
    pub assumed_config_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionReceipt {
    pub receipt_id: String,
    pub action_id: String,
    pub timestamp_ms: u64,
    pub authorized_by: String,
}

pub trait AuthorityGate {
    fn validate_and_execute(
        &self,
        action_id: &str,
        evidence: &AuthorizationEvidence,
        current_config_hash: &str,
    ) -> Result<ExecutionReceipt, String>;
}

pub struct VardhanGate;

impl AuthorityGate for VardhanGate {
    fn validate_and_execute(
        &self,
        action_id: &str,
        evidence: &AuthorizationEvidence,
        current_config_hash: &str,
    ) -> Result<ExecutionReceipt, String> {
        info!(
            "AuthorityGate evaluating action {} (auth: {})",
            action_id, evidence.authorization_id
        );

        // A7 Validation 1: Authorization tracing
        if action_id != evidence.authorization_id {
            error!(
                "Gate failure: action_id {} does not match authorization_id {}",
                action_id, evidence.authorization_id
            );
            return Err("Authorization mismatch".to_string());
        }

        // A7 Validation 2: Assurance Result
        if evidence.final_status != ActionStatus::Pass {
            error!(
                "Gate failure: Twin status is not Pass (was {:?})",
                evidence.final_status
            );
            return Err("Assurance failed".to_string());
        }

        // A7 Validation 3: Configuration alignment
        if evidence.assumed_config_hash != current_config_hash {
            error!(
                "Gate failure: Stale configuration. Evidence: {}, Current: {}",
                evidence.assumed_config_hash, current_config_hash
            );
            return Err("Configuration mismatch".to_string());
        }

        // Success: Issue Execution Receipt
        let receipt = ExecutionReceipt {
            receipt_id: format!("receipt-{}", action_id),
            action_id: action_id.to_string(),
            timestamp_ms: 1234567890, // TODO: Clock implementation
            authorized_by: "VardhanGate".to_string(),
        };

        info!(
            "Execution authorized. Receipt issued: {}",
            receipt.receipt_id
        );
        Ok(receipt)
    }
}

use vardhan_state::authorization::{Authorization, AuthorizationContext, ActionType};
use vardhan_state::scope::CanonicalTenantId;

pub trait SystemicAuthorityGate {
    fn authorize_systemic_fault(
        &self,
        tenant_id: CanonicalTenantId,
        authorization: &Authorization,
        current_config_hash: &vardhan_state::id::ConfigurationHash,
        current_state_hash: &vardhan_state::id::StateHash,
    ) -> Result<ExecutionReceipt, String>;
}

impl SystemicAuthorityGate for VardhanGate {
    fn authorize_systemic_fault(
        &self,
        tenant_id: CanonicalTenantId,
        authorization: &Authorization,
        current_config_hash: &vardhan_state::id::ConfigurationHash,
        _current_state_hash: &vardhan_state::id::StateHash, // In real impl, check state hash
    ) -> Result<ExecutionReceipt, String> {
        info!("VardhanGate evaluating Systemic Fault Authorization: {:?}", authorization.auth_id);
        
        // Tenant boundary enforcement
        if authorization.tenant_scoped.tenant_id() != tenant_id.0 {
            return Err("Tenant boundary violation".to_string());
        }
        
        // Action Type validation
        if authorization.action_type != ActionType::SystemicFaultInjection {
            return Err("Invalid action type for systemic fault".to_string());
        }
        
        // Authorization Context Validation
        match &authorization.authorization_context {
            AuthorizationContext::SystemicVerification { .. } => {},
            _ => return Err("Invalid authorization context for systemic fault".to_string()),
        }
        
        // Configuration alignment
        if &authorization.config_hash != current_config_hash {
            return Err("Configuration mismatch".to_string());
        }
        
        // Success
        Ok(ExecutionReceipt {
            receipt_id: format!("sys-receipt-{}", authorization.auth_id),
            action_id: authorization.action_id.to_string(),
            timestamp_ms: 1234567890,
            authorized_by: "VardhanGate-Systemic".to_string(),
        })
    }
}
