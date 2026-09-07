pub mod compliance;

use std::net::SocketAddr;
use std::time::Instant;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tracing::{info, error};
use core_crypto::QuantumNodeIdentity;
use proxy_engine::aes_gcm_seal;

#[derive(Clone, Debug)]
pub struct IngressTelemetryEvent {
    pub raw_bytes: Vec<u8>,
    pub encrypted_bytes: Vec<u8>,
    pub entropy_bits: f64,
    pub latency_ms: u64,
    pub peer_addr: SocketAddr,
}

pub struct IngressShield {
    pub listen_addr: SocketAddr,
    pub session_key: [u8; 32],
}

impl IngressShield {
    pub fn new(listen_addr: SocketAddr, session_key: [u8; 32]) -> Self {
        Self { listen_addr, session_key }
    }

    pub fn calculate_entropy(data: &[u8]) -> f64 {
        if data.is_empty() {
            return 0.0;
        }
        let mut frequency = [0u64; 256];
        for &byte in data {
            frequency[byte as usize] += 1;
        }
        let len_f = data.len() as f64;
        frequency
            .iter()
            .filter(|&&count| count > 0)
            .map(|&count| {
                let p = count as f64 / len_f;
                -p * p.log2()
            })
            .sum()
    }

    pub async fn run_interceptor_loop(
        &self,
        telemetry_tx: tokio::sync::mpsc::Sender<IngressTelemetryEvent>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(self.listen_addr).await?;
        info!(addr = %self.listen_addr, "pq_shield Ingress Socket Bound & Listening");

        loop {
            let (mut stream, peer_addr) = listener.accept().await?;
            let key = self.session_key;
            let tx = telemetry_tx.clone();

            tokio::spawn(async move {
                let mut buffer = vec![0u8; 4096];
                loop {
                    let start = Instant::now();
                    match stream.read(&mut buffer).await {
                        Ok(0) => break, // Connection closed
                        Ok(n) => {
                            let plaintext = buffer[..n].to_vec();
                            if let Ok(ciphertext) = aes_gcm_seal(&key, &plaintext) {
                                let entropy = Self::calculate_entropy(&ciphertext);
                                let elapsed = start.elapsed().as_millis() as u64;

                                let event = IngressTelemetryEvent {
                                    raw_bytes: plaintext,
                                    encrypted_bytes: ciphertext,
                                    entropy_bits: entropy,
                                    latency_ms: elapsed,
                                    peer_addr,
                                };

                                let _ = tx.send(event).await;
                            }
                        }
                        Err(_) => break, // Error
                    }
                }
            });
        }
    }
}
