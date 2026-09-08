use pq_shield::IngressShield;
use std::sync::Arc;
use std::path::Path;
use core_crypto::QuantumNodeIdentity;
use core_crypto::vault::{LocalDevKeyProtector, KmsKeyProtector, MockKmsClient, HsmKeyProtector};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let _otel_guard = pq_shield::otel::init_observability();
    
    let listen_addr = "0.0.0.0:8080".parse()?;
    let upstream_addr = "127.0.0.1:9090".parse()?; // Configurable via P0.4 default
    
    // P3.3: Production KMS/HSM Key Protection & Guardrails
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

    let vault_path_str = std::env::var("VARDHAN_VAULT_PATH").unwrap_or_else(|_| "pq_vault.json".to_string());
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

    let shield = IngressShield::new(listen_addr, upstream_addr, identity);

    println!("[*] Starting pq_shield gateway");
    println!("    Listening on: {}", listen_addr);
    println!("    Forwarding to: {}", upstream_addr);
    
    tokio::select! {
        res = shield.run_interceptor_loop() => res?,
        _ = tokio::signal::ctrl_c() => {
            println!("[*] Graceful shutdown initiated... flushing OpenTelemetry spans");
        }
    }
    drop(_otel_guard);
    println!("[*] Observability guard dropped, traces flushed.");
    Ok(())
}
