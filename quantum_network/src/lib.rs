use core_crypto::QuantumNodeIdentity;
use ledger_sync::LedgerBlock;
use proxy_engine::{aes_gcm_open, aes_gcm_seal};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tracing::{info, warn};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum GossipMessage {
    PeerExchange(Vec<SocketAddr>),
    BlockBroadcast(LedgerBlock),
}

#[derive(Clone, Default)]
pub struct PeerRegistry {
    peers: Arc<RwLock<HashSet<SocketAddr>>>,
}

impl PeerRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn register_peer(&self, addr: SocketAddr) -> bool {
        self.peers.write().await.insert(addr)
    }

    pub async fn get_peers(&self) -> Vec<SocketAddr> {
        self.peers.read().await.iter().copied().collect()
    }
}

pub struct GossipEngine {
    identity: Arc<QuantumNodeIdentity>,
    registry: PeerRegistry,
    seen_blocks: Arc<RwLock<HashSet<[u8; 32]>>>,
    block_tx: mpsc::Sender<LedgerBlock>,
}

impl GossipEngine {
    pub fn new(
        identity: Arc<QuantumNodeIdentity>,
        registry: PeerRegistry,
        block_tx: mpsc::Sender<LedgerBlock>,
    ) -> Self {
        Self {
            identity,
            registry,
            seen_blocks: Arc::new(RwLock::new(HashSet::new())),
            block_tx,
        }
    }

    pub async fn process_incoming_gossip(
        &self,
        session_key: &[u8; 32],
        encrypted_payload: &[u8],
    ) -> Result<(), String> {
        let payload = aes_gcm_open(session_key, encrypted_payload)
            .map_err(|e| format!("Decrypt error: {e}"))?;
        let msg: GossipMessage = serde_json::from_slice(&payload)
            .map_err(|e| format!("Serde error: {e}"))?;

        match msg {
            GossipMessage::PeerExchange(addrs) => {
                for addr in addrs {
                    if self.registry.register_peer(addr).await {
                        info!(peer = %addr, "Discovered new peer via gossip");
                    }
                }
            }
            GossipMessage::BlockBroadcast(block) => {
                let mut seen = self.seen_blocks.write().await;
                if seen.insert(block.block_hash) {
                    info!(
                        block_index = block.index,
                        "Gossip block accepted and forwarded to ledger queue"
                    );
                    let _ = self.block_tx.send(block).await;
                }
            }
        }
        Ok(())
    }

    pub async fn create_gossip_frame(
        &self,
        session_key: &[u8; 32],
        msg: &GossipMessage,
    ) -> Result<Vec<u8>, String> {
        let serialized = serde_json::to_vec(msg).map_err(|e| e.to_string())?;
        aes_gcm_seal(session_key, &serialized).map_err(|e| e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use core_crypto::QuantumNodeIdentity;

    #[tokio::test]
    async fn test_gossip_block_deduplication() {
        let identity = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());
        let registry = PeerRegistry::new();
        let (tx, mut rx) = mpsc::channel(10);
        let engine = GossipEngine::new(identity.clone(), registry, tx);

        let dummy_key = [7u8; 32];
        let block = LedgerBlock {
            index: 1,
            timestamp_ms: 1000,
            prev_hash: [0u8; 32],
            session_id: [0u8; 32],
            payload_hash: [0u8; 32],
            block_hash: [42u8; 32],
            dsa_signature: vec![1, 2, 3],
        };

        let frame = engine
            .create_gossip_frame(&dummy_key, &GossipMessage::BlockBroadcast(block))
            .await
            .unwrap();

        // First process: should succeed and send to channel
        engine.process_incoming_gossip(&dummy_key, &frame).await.unwrap();
        assert!(rx.recv().await.is_some());

        // Duplicate process: deduplicated by seen_blocks hash set
        engine.process_incoming_gossip(&dummy_key, &frame).await.unwrap();
        assert!(rx.try_recv().is_err());
    }
}
