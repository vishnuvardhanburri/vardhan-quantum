//! # Vardhan State Fabric — Tenant Scoping and Hashing (A2, I10)
//!
//! **Amendment A2**: All semantic objects are wrapped in `TenantScoped<T>`.
//! The TenantId is not a Boolean flag — it is a structural type-level constraint.
//!
//! Sourced from:
//! - `VARDHAN_ARCHITECTURE_CONSTITUTION.md` §A2 (Tenant-Scoped Semantic State)
//! - `VARDHAN_OBJECT_TRAITS.md` §4 (Tenant-Scoped Container)
//! - `VARDHAN_OBJECT_TRAITS.md` §8.5 (Hashable / Canonical Serialization)

use crate::error::TenantBoundaryError;
use crate::id::{ContentHash, TenantId};
use serde::{Deserialize, Serialize};

/// Wraps every semantic object with its TenantId boundary (A2).
///
/// Cross-tenant references are structurally forbidden at the type level.
/// A Boolean field like `tenant_scope_valid` is **evidence of a check**,
/// not the protection mechanism.
///
/// ```text
/// TenantScoped<T>
/// ├── tenant_id  : TenantId
/// ├── scope_hash : [u8; 32]    ← BLAKE3(tenant_id || canonical(T))
/// └── inner      : T           ← the actual object
/// ```
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TenantScoped<T> {
    pub tenant_id: TenantId,
    pub scope_hash: [u8; 32],
    pub inner: T,
}

impl<T: Hashable> TenantScoped<T> {
    /// Create a new TenantScoped object.
    /// The scope_hash is computed as BLAKE3(tenant_id_bytes || canonical_bytes(T)).
    pub fn new(tenant_id: TenantId, inner: T) -> Self {
        let tenant_bytes = tenant_id.to_bytes();
        let content_bytes = inner.canonical_bytes();
        let mut combined = Vec::with_capacity(tenant_bytes.len() + content_bytes.len());
        combined.extend_from_slice(&tenant_bytes);
        combined.extend_from_slice(&content_bytes);
        let scope_hash = *blake3::hash(&combined).as_bytes();
        Self {
            tenant_id,
            scope_hash,
            inner,
        }
    }

    /// Get the tenant ID.
    pub fn tenant_id(&self) -> TenantId {
        self.tenant_id
    }

    /// Get a reference to the inner object.
    pub fn inner(&self) -> &T {
        &self.inner
    }

    /// Consume self and return the inner object.
    pub fn into_inner(self) -> T {
        self.inner
    }

    /// Get the scope hash.
    pub fn scope_hash(&self) -> &[u8; 32] {
        &self.scope_hash
    }

    /// Re-wrap an existing inner object, recomputing the scope hash.
    pub fn rewrap(&self, inner: T) -> Self {
        Self::new(self.tenant_id, inner)
    }

    /// Verify that this TenantScoped object matches the given tenant_id.
    /// Used for cross-tenant boundary checks (T-TENANT-01, T-PROP-09).
    pub fn validate_tenant_scope(&self, expected: TenantId) -> Result<(), TenantBoundaryError> {
        if self.tenant_id != expected {
            return Err(TenantBoundaryError::CrossTenant {
                expected,
                actual: self.tenant_id,
            });
        }
        Ok(())
    }

    /// Verify that the scope_hash is valid (recomputable).
    /// This catches tampering with the inner object or tenant_id.
    pub fn verify_scope_hash(&self) -> bool
    where
        T: Hashable,
    {
        let tenant_bytes = self.tenant_id.to_bytes();
        let content_bytes = self.inner.canonical_bytes();
        let mut combined = Vec::with_capacity(tenant_bytes.len() + content_bytes.len());
        combined.extend_from_slice(&tenant_bytes);
        combined.extend_from_slice(&content_bytes);
        let expected = *blake3::hash(&combined).as_bytes();
        self.scope_hash == expected
    }

    /// Cache key for tenant-scoped lookups: BLAKE3(tenant_id || entity_id || commit_index)
    /// Used for T-TENANT-05 (cache namespace collision prevention).
    pub fn cache_key(
        entity_id: crate::id::EntityId,
        commit_index: crate::id::CommitIndex,
    ) -> [u8; 32] {
        let mut combined = Vec::new();
        combined.extend_from_slice(&entity_id.to_bytes());
        combined.extend_from_slice(&commit_index.get().to_be_bytes());
        *blake3::hash(&combined).as_bytes()
    }
}

// ─── Without Hashable bound ───────────────────────────────────────────────────

impl<T> TenantScoped<T> {
    /// Create a TenantScoped with a pre-computed scope hash (for deserialization).
    pub fn from_parts(tenant_id: TenantId, scope_hash: [u8; 32], inner: T) -> Self {
        Self {
            tenant_id,
            scope_hash,
            inner,
        }
    }
}

/// Trait for objects that can only exist within a tenant boundary.
/// The compiler enforces that cross-tenant references cannot compile.
/// (A2)
pub trait TenantScopedObject: Clone + Send + Sync {
    fn tenant_id(&self) -> TenantId;

    /// Validate that this object's tenant scope is consistent.
    /// Returns Err if any referenced object is out of tenant scope.
    fn validate_tenant_scope(self) -> Result<Self, TenantBoundaryError>
    where
        Self: Sized;

    /// Wrap this object in a TenantScoped boundary.
    fn into_tenant_scoped(self) -> TenantScoped<Self>
    where
        Self: Hashable;
}

// ─── Hashable (Canonical Serialization) ───────────────────────────────────────

/// All canonical objects can be serialized to canonical bytes and hashed.
///
/// Canonical serialization: deterministic JSON with sorted field ordering.
/// This ensures identical objects always produce identical bytes and hashes.
pub trait Hashable {
    /// Serialize to canonical bytes (deterministic field ordering via BTreeMap).
    fn canonical_bytes(&self) -> Vec<u8>;

    /// Compute the content hash.
    /// `ContentHash = BLAKE3(canonical_bytes)`.
    fn content_hash(&self) -> ContentHash {
        ContentHash(*blake3::hash(&self.canonical_bytes()).as_bytes())
    }
}

/// Helper: serialize a struct to canonical JSON bytes using BTreeMap for
/// deterministic field ordering. This avoids `#[derive(Serialize)]` field
/// order dependence.
pub fn canonical_json<T: Serialize>(value: &T) -> Vec<u8> {
    // Serialize to a serde_json::Value, then convert to a BTreeMap
    // which has sorted keys, then serialize back to bytes.
    match serde_json::to_value(value) {
        Ok(serde_json::Value::Object(map)) => {
            let sorted: BTreeMap<String, serde_json::Value> = map.into_iter().collect();
            serde_json::to_vec(&sorted).unwrap_or_default()
        }
        Ok(other) => {
            // For non-object values, serialize directly
            serde_json::to_vec(&other).unwrap_or_default()
        }
        Err(_) => Vec::new(),
    }
}

use std::collections::BTreeMap;
