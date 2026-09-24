use serde::{Deserialize, Serialize};
use crate::identity::{VerificationClaimId, ExecutionPlanId, VerificationRunRecordId, EvidenceQuorumSnapshotId, VerificationFindingId};
use vardhan_state::id::EvidenceId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GraphNode {
    Claim(VerificationClaimId),
    Plan(ExecutionPlanId),
    Run(VerificationRunRecordId),
    Evidence(EvidenceId),
    Quorum(EvidenceQuorumSnapshotId),
    Finding(VerificationFindingId),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct GraphEdge {
    pub from: GraphNode,
    pub to: GraphNode,
    pub relationship: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationGraph {
    pub claim_id: VerificationClaimId,
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

impl VerificationGraph {
    pub fn new(claim_id: VerificationClaimId) -> Self {
        Self {
            claim_id,
            nodes: vec![GraphNode::Claim(claim_id)],
            edges: Vec::new(),
        }
    }
    
    pub fn add_node(&mut self, node: GraphNode) {
        if !self.nodes.contains(&node) {
            self.nodes.push(node);
        }
    }
    
    pub fn add_edge(&mut self, from: GraphNode, to: GraphNode, relationship: impl Into<String>) {
        self.add_node(from.clone());
        self.add_node(to.clone());
        self.edges.push(GraphEdge {
            from,
            to,
            relationship: relationship.into(),
        });
    }
}
