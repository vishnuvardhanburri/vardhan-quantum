use std::sync::Arc;
use vardhan_state::evidence::{
    EvidenceRecord, AuthContext, EvidenceCategory, Signature, EvidenceStatus, ProvenanceEntry
};
use vardhan_state::id::{
    TenantId, ContentHash, ConfigurationHash, EvidenceLogicalId, SchemaVersion, ObjectRef, EvidenceId, CommitIndex
};
use vardhan_state::time::{now_utc, TimeContext};
use vardhan_state::store::EvidenceStore;
use crate::run_record::{VerificationRunRecord, RunOutcome};
use crate::scope::CanonicalTenantId;

pub struct EvidencePipeline<E: EvidenceStore> {
    pub evidence_store: Arc<E>,
}

impl<E: EvidenceStore> EvidencePipeline<E> {
    pub fn new(evidence_store: Arc<E>) -> Self {
        Self { evidence_store }
    }

    pub fn process_verification_run(
        &self,
        tenant_id: CanonicalTenantId,
        run_record: &mut VerificationRunRecord,
    ) -> Result<(), &'static str> {
        
        let payload = serde_json::to_vec(run_record).map_err(|_| "Failed to serialize run record")?;
        let payload_digest = ContentHash(*blake3::hash(&payload).as_bytes());
        
        let config_hash = ConfigurationHash(run_record.config_hash.0);
        let ts = now_utc();
        
        let mut evidence = EvidenceRecord {
            evidence_id: EvidenceId::ZERO,
            tenant_id: tenant_id.0,
            event_id: None,
            entity_id: None,
            source: "proofmesh.verification_run".to_string(),
            timestamp: TimeContext {
                logical_time: None,
                event_time: ts,
                system_time: ts,
                deadline_time: None,
                created_at: ts,
            },
            schema_version: SchemaVersion::new(1, 0, 0),
            payload_digest,
            predecessor: None,
            provenance: vec![],
            authorization_context: None,
            signatures: vec![],
            evidence_category: EvidenceCategory::Verification,
            config_hash,
            state_hash: Some(run_record.state_hash),
            commit_index: None,
            related_object_refs: vec![],
            status: EvidenceStatus::Created,
            logical_id: EvidenceLogicalId::from_uuid(uuid::Uuid::new_v4()),
        };
        
        let evidence_bytes = serde_json::to_vec(&evidence).unwrap();
        evidence.evidence_id = EvidenceId(*blake3::hash(&evidence_bytes).as_bytes());
        
        let _ = self.evidence_store.append(evidence.clone()).map_err(|_| "Failed to append to EvidenceStore")?;
        
        Ok(())
    }
}
