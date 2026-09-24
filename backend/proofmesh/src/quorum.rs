use serde::{Deserialize, Serialize};
use vardhan_state::id::{CommitIndex, ContentHash, EvidenceId, ExecutionId};
use crate::identity::{EvidenceQuorumSnapshotId, VerificationClaimId};
use crate::authorization::ProvenanceTrail;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum QuorumStatus {
    Satisfied,
    Unsatisfied,
    CommonModeCompromised,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IndependenceDimensions {
    pub execution_processes: usize,
    pub fault_domains: usize,
    pub temporal_separation_ms: u64,
    pub environments: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvidenceQuorumSnapshot {
    pub snapshot_id: EvidenceQuorumSnapshotId,
    pub claim_id: VerificationClaimId,
    pub participating_evidence_ids: Vec<EvidenceId>,
    pub evidence_types: Vec<String>,
    pub execution_ids: Vec<ExecutionId>,
    pub dimensions: IndependenceDimensions,
    pub required_quorum: usize,
    pub achieved_quorum: usize,
    pub common_mode_risk_assessment: String,
    pub as_of_commit_index: CommitIndex,
    pub policy_hash: ContentHash,
    pub config_hash: ContentHash,
    pub resulting_quorum_status: QuorumStatus,
    pub provenance: ProvenanceTrail,
}
