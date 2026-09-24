use serde::{Deserialize, Serialize};
use vardhan_state::id::{ContentHash, StateHash};
use crate::identity::{ExecutionPlanId, VerificationClaimId};
use vardhan_state::authorization::ProvenanceTrail;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExecutionPool {
    Fast,
    Security,
    Distributed,
    Fuzz,
    Fault,
    Replay,
    Deep,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExecutionTarget {
    RustTest(String),
    CargoNextest(String),
    Replay(String),
    FaultHarness(String),
    InternalVerification(String),
    Process(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ResourceBounds {
    pub max_cpu_ms: u64,
    pub max_memory_bytes: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExecutionStep {
    pub step_id: String,
    pub target: ExecutionTarget,
    pub arguments: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExecutionPlan {
    pub plan_id: ExecutionPlanId,
    pub claim_ref: VerificationClaimId,
    pub steps: Vec<ExecutionStep>,
    pub pool: ExecutionPool,
    pub resource_bounds: ResourceBounds,
    pub timeout_ms: u64,
    pub seed: u64,
    pub env_fingerprint: String,
    pub expected_evidence: Vec<String>,
    pub policy_ref: String,
    pub config_hash: ContentHash,
    pub state_hash: StateHash,
    pub provenance: ProvenanceTrail,
}

impl ExecutionPlan {
    pub fn validate_determinism(&self) -> Result<(), &'static str> {
        if self.timeout_ms == 0 {
            return Err("ExecutionPlan requires a bounded timeout");
        }
        if self.steps.is_empty() {
            return Err("ExecutionPlan must have at least one step");
        }
        Ok(())
    }
}
