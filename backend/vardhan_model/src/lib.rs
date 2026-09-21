//! # Vardhan Model — Common Enterprise Data Fabric
//!
//! Layer 6: Vardhan Data Fabric
//!
//! This crate provides the canonical data model for the Vardhan Quantum
//! enterprise intelligence platform. It is the **common language** through
//! which every Vardhan subsystem communicates:
//!
//! - **VardhanEvent** — the universal event schema (one schema, not five)
//! - **Enterprise entities** — typed objects for every enterprise principal
//! - **DependencyGraph** — explicit relationships between entities
//! - **Schema versioning** — compatibility rules for evolution
//!
//! This layer is **independent of any LLM** and must function without one.
//!
//! ## Design Principles
//!
//! 1. One canonical event schema — no subsystem-specific variants
//! 2. Deterministic serialization (serde_json, sorted field order)
//! 3. Tenant isolation via `tenant_id` on every event
//! 4. Evidence linkage via `evidence_ref`
//! 5. Schema versioning with compatibility rules
//! 6. Explicit entity relationships (no implicit joins or inferred links)

pub mod events;
pub mod graph;
pub mod entities;
pub mod schema;
pub mod identity;

pub use events::{
    VardhanEvent, EventBuilder, EventType, Severity, Confidence, EventId,
    EMITTER_PQ_SHIELD, EMITTER_AUTH_SERVICE, EMITTER_HA_CLUSTER,
    EMITTER_RAFT_LISTENER, EMITTER_QUANTUM_NODE, EventValidationError,
    EVENT_ACTIONS, VARDHAN_EVENT_SCHEMA_VERSION,
};
pub use entities::{
    Entity, EntityId, EntityType, EntityError,
    Tenant, Organization, BusinessUnit, Application, Service, Asset,
    Node, Container, Identity,
    CryptoAsset, CryptoKey, Certificate,
    BusinessProcess, Transaction, Risk, Control, Policy,
    Decision, Action, Outcome, Incident,
};
pub use graph::{Relationship, DependencyGraph, TraversalResult, GraphError};
pub use schema::{SchemaVersion, SchemaCompatibility, SchemaRegistry};
pub use identity::{PrincipalRef, PrincipalKind, PrincipalRegistry, IdentityError};
