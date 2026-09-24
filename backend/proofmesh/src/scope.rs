use serde::{Deserialize, Serialize};
use vardhan_state::id::TenantId;
use uuid::uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerificationScope {
    Global,
    Platform,
    Tenant(TenantId),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CanonicalTenantId(pub TenantId);

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DecodeError {
    ScopeMismatch,
}

// Fixed reserved IDs as per FA-1 semantics
const GLOBAL_UUID: uuid::Uuid = uuid!("00000000-0000-0000-0000-000000000001");
const PLATFORM_UUID: uuid::Uuid = uuid!("00000000-0000-0000-0000-000000000002");

impl CanonicalTenantId {
    /// Validates the tenant ID against the object's stated verification scope.
    /// This is a deterministic RUNTIME VALIDATION INVARIANT (FA-1).
    pub fn validate_context(self, object_scope: VerificationScope) -> Result<TenantId, DecodeError> {
        let current_uuid = *self.0.as_uuid();
        
        match object_scope {
            VerificationScope::Global => {
                if current_uuid == GLOBAL_UUID {
                    Ok(self.0)
                } else {
                    Err(DecodeError::ScopeMismatch)
                }
            },
            VerificationScope::Platform => {
                if current_uuid == PLATFORM_UUID {
                    Ok(self.0)
                } else {
                    Err(DecodeError::ScopeMismatch)
                }
            },
            VerificationScope::Tenant(expected_tenant) => {
                // Ensure the expected tenant is not secretly using reserved global/platform IDs
                let expected_uuid = *expected_tenant.as_uuid();
                if current_uuid == expected_uuid 
                    && current_uuid != GLOBAL_UUID
                    && current_uuid != PLATFORM_UUID 
                {
                    Ok(expected_tenant)
                } else {
                    Err(DecodeError::ScopeMismatch)
                }
            }
        }
    }
}
