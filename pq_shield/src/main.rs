use pq_shield::IngressShield;
use std::sync::Arc;
use std::path::Path;
use core_crypto::QuantumNodeIdentity;
use core_crypto::vault::{LocalDevKeyProtector, KmsKeyProtector, MockKmsClient, HsmKeyProtector};
#[cfg(feature = "aws-kms-real")]
use core_crypto::vault::AwsSdkKmsClient;
use ha_cluster::{
    ClusterMembership, NodeId,
    drain::{ActiveSessionCounter, DrainController},
    heartbeat::{HeartbeatConfig, start_heartbeat},
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let _otel_guard = pq_shield::otel::init_observability();

    // ── Network addresses ────────────────────────────────────────────────────
    let listen_port: u16 = std::env::var("VARDHAN_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let listen_addr: std::net::SocketAddr =
        format!("0.0.0.0:{}", listen_port).parse()?;
    let upstream_addr: std::net::SocketAddr = std::env::var("VARDHAN_UPSTREAM")
        .unwrap_or_else(|_| "127.0.0.1:9090".to_string())
        .parse()?;

    // ── P3.3: Production KMS/HSM Key Protection & Guardrails ────────────────
    let env_mode = std::env::var("VARDHAN_ENV").unwrap_or_else(|_| "development".to_string());
    let protector_choice = std::env::var("VARDHAN_KEY_PROTECTOR")
        .unwrap_or_else(|_| {
            if env_mode == "production" {
                "aws-kms".to_string()
            } else {
                "local-dev".to_string()
            }
        });

    if env_mode == "production" && protector_choice == "local-dev" {
        eprintln!("FATAL SECURITY ERROR: LocalDevKeyProtector is strictly forbidden in production (VARDHAN_ENV=production).");
        eprintln!("Configure VARDHAN_KEY_PROTECTOR=aws-kms or pkcs11 to protect the persistent node identity with KMS/HSM.");
        std::process::exit(1);
    }

    let vault_path_str = std::env::var("VARDHAN_VAULT_PATH")
        .unwrap_or_else(|_| "pq_vault.json".to_string());
    let vault_path = Path::new(&vault_path_str);

    println!("[*] Loading / Generating Quantum Node Identity using [{}] protector...", protector_choice);

    let identity = match protector_choice.as_str() {
        "local-dev" => {
            let kek_path = std::env::var("VARDHAN_KEK_PATH").unwrap_or_else(|_| "kek.bin".to_string());
            let protector = LocalDevKeyProtector::new(Path::new(&kek_path).to_path_buf());
            QuantumNodeIdentity::load_or_generate(vault_path, &protector)?
        }
        "aws-kms" => {
            let key_id = std::env::var("KMS_KEY_ID")
                .unwrap_or_else(|_| "arn:aws:kms:us-east-1:123456789012:key/vardhan-gateway-root".to_string());
            let mock_client = MockKmsClient::new().with_key(&key_id);
            if std::env::var("KMS_SIMULATE_OUTAGE").map(|v| v == "true" || v == "1").unwrap_or(false) {
                mock_client.set_available(false);
            }
            if std::env::var("KMS_SIMULATE_UNAUTHORIZED").map(|v| v == "true" || v == "1").unwrap_or(false) {
                mock_client.set_authorized(false);
            }
            let protector = KmsKeyProtector::new(key_id, Arc::new(mock_client));
            QuantumNodeIdentity::load_or_generate(vault_path, &protector)?
        }
        #[cfg(feature = "aws-kms-real")]
        "aws-kms-real" => {
            let key_id = std::env::var("KMS_KEY_ID")
                .expect("FATAL: KMS_KEY_ID must be set when VARDHAN_KEY_PROTECTOR=aws-kms-real");
            let kms_client = AwsSdkKmsClient::new(&key_id)
                .expect("FATAL: Failed to initialize AWS KMS client");
            let protector = KmsKeyProtector::new(key_id, Arc::new(kms_client));
            QuantumNodeIdentity::load_or_generate(vault_path, &protector)?
        }
        "mock-hsm" | "pkcs11" => {
            let slot_id: u64 = std::env::var("HSM_SLOT_ID").ok().and_then(|s| s.parse().ok()).unwrap_or(1);
            let key_label = std::env::var("HSM_KEY_LABEL").unwrap_or_else(|_| "quantum-hsm-cmk".to_string());
            let protector = HsmKeyProtector::new_mock(slot_id, key_label);
            QuantumNodeIdentity::load_or_generate(vault_path, &protector)?
        }
        other => {
            eprintln!("FATAL: Unknown VARDHAN_KEY_PROTECTOR choice: '{other}'. Expected 'local-dev', 'aws-kms', or 'mock-hsm'");
            std::process::exit(1);
        }
    };
    let identity = Arc::new(identity);

    // ── P3.4: Cluster bootstrap ───────────────────────────────────────────────
    let self_node_id = NodeId::new(
        std::env::var("VARDHAN_NODE_ID").unwrap_or_else(|_| {
            // Stable default: hostname + port
            let hostname = std::env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string());
            format!("{}-{}", hostname, listen_port)
        }),
    );

    let heartbeat_port: u16 = std::env::var("VARDHAN_HEARTBEAT_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(18080);

    let drain_timeout_secs: u64 = std::env::var("VARDHAN_DRAIN_TIMEOUT_SECS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(30);

    let membership = Arc::new(ClusterMembership::new());
    let region = std::env::var("VARDHAN_REGION").unwrap_or_default();
    if region.is_empty() {
        membership.register_self(self_node_id.clone(), listen_addr, heartbeat_port).await;
    } else {
        membership.register_self_with_region(
            self_node_id.clone(), listen_addr, heartbeat_port, region.clone()
        ).await;
    }

    // Seed initial peers from VARDHAN_CLUSTER_PEERS="host1:port1,host2:port2"
    if let Ok(peers_env) = std::env::var("VARDHAN_CLUSTER_PEERS") {
        for peer_str in peers_env.split(',').map(str::trim).filter(|s| !s.is_empty()) {
            if let Ok(peer_addr) = peer_str.parse::<std::net::SocketAddr>() {
                let peer_id = NodeId::new(format!("seed-{}", peer_str));
                let peer_hb_port = peer_addr.port(); // Assume seeded port is the heartbeat port
                // P3.5: If we have a region and the seed is in the same region, tag it.
                // Cross-region seeds keep empty region (discovered via heartbeat).
                let peer_node = if region.is_empty() {
                    ha_cluster::ClusterNode::new(peer_id, peer_addr, peer_hb_port)
                } else {
                    ha_cluster::ClusterNode::new(peer_id, peer_addr, peer_hb_port)
                };
                membership
                    .apply_heartbeat(peer_node)
                    .await;
                println!("[*] Seeded cluster peer: {}", peer_addr);
            }
        }
    }

    // Start heartbeat loop (UDP)
    let hb_config = HeartbeatConfig::new(self_node_id.clone(), listen_addr, heartbeat_port);
    let _hb_handle = start_heartbeat(hb_config, Arc::clone(&membership)).await
        .map_err(|e| format!("Heartbeat bind error: {e}"))?;
    println!("[*] Cluster heartbeat started on UDP port {}", heartbeat_port);

    // Session counter (for graceful drain)
    let session_counter = ActiveSessionCounter::new();

    let shield = IngressShield::new_with_cluster(
        listen_addr,
        upstream_addr,
        identity,
        self_node_id.clone(),
        Arc::clone(&membership),
        session_counter.clone(),
    );

    println!("[*] Starting pq_shield gateway (P3.4 HA-aware)");
    println!("    Node ID:      {}", self_node_id);
    println!("    Listening on: {}", listen_addr);
    println!("    Forwarding to: {}", upstream_addr);
    println!("    Heartbeat UDP: {}", heartbeat_port);

    let drain_ctrl = DrainController::new(
        self_node_id.clone(),
        Arc::clone(&membership),
        session_counter,
        drain_timeout_secs,
    );

    tokio::select! {
        res = shield.run_interceptor_loop() => res?,
        _ = tokio::signal::ctrl_c() => {
            println!("[*] SIGTERM/Ctrl-C received — initiating graceful drain...");
            let clean = drain_ctrl.drain().await;
            if clean {
                println!("[*] Drain complete — clean exit.");
            } else {
                println!("[!] Drain timed out — force exiting.");
            }
            println!("[*] Flushing OpenTelemetry spans...");
        }
    }
    drop(_otel_guard);
    println!("[*] Observability guard dropped, traces flushed.");
    Ok(())
}
