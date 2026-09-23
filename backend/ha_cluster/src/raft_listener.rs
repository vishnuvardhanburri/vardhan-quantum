use crate::raft::{
    AppendEntriesArgs, AppendEntriesReply, RaftNode, RaftRpcEnvelope, RaftRpcType, RequestVoteArgs,
    RequestVoteReply,
};
use core_crypto::QuantumNodeIdentity;
use proxy_engine::run_responder;
use proxy_engine::transport::AeadTransport;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::net::TcpStream;

pub struct RaftNetworkListener {
    listen_addr: std::net::SocketAddr,
    identity: Arc<QuantumNodeIdentity>,
    raft_node: Arc<RaftNode>,
}

impl RaftNetworkListener {
    pub async fn new(
        listen_addr: std::net::SocketAddr,
        identity: Arc<QuantumNodeIdentity>,
        raft_node: Arc<RaftNode>,
    ) -> std::io::Result<(Self, tokio::net::TcpListener, std::net::SocketAddr)> {
        let listener = tokio::net::TcpListener::bind(listen_addr).await?;
        let bound_addr = listener.local_addr()?;
        Ok((Self {
            listen_addr: bound_addr,
            identity,
            raft_node,
        }, listener, bound_addr))
    }

    pub async fn run(&self, listener: tokio::net::TcpListener) -> Result<(), Box<dyn std::error::Error>> {
        info!(addr = %self.listen_addr, "Raft Network Listener active");

        // SEC-005: Inbound connection limit to prevent FD exhaustion DoS
        let conn_limit = Arc::new(tokio::sync::Semaphore::new(100));

        loop {
            let (mut stream, peer_addr) = listener.accept().await?;
            let identity = Arc::clone(&self.identity);
            let raft_node = Arc::clone(&self.raft_node);
            
            let permit = match Arc::clone(&conn_limit).try_acquire_owned() {
                Ok(p) => p,
                Err(_) => {
                    warn!(peer = %peer_addr, "Raft RPC connection limit reached, dropping connection");
                    continue;
                }
            };

            tokio::spawn(async move {
                // Drop the permit only when the connection task finishes
                let _permit = permit;
                
                info!(peer = %peer_addr, "Incoming Raft connection");

                // 1. PQ Handshake (Responder)
                let session = match run_responder(&mut stream, &identity).await {
                    Ok(s) => s,
                    Err(e) => {
                        warn!(peer = %peer_addr, err = %e, "PQ handshake failed");
                        return;
                    }
                };

                // SEC-001: Compute the authenticated peer's DSA fingerprint
                // (BLAKE3 of the verified DSA public key from the handshake).
                // This fingerprint is pinned for the entire connection lifetime.
                let peer_dsa_fingerprint = QuantumNodeIdentity::hash_ledger_block(&session.peer_dsa_pub_bytes);
                let _peer_fingerprint_hex = hex::encode(peer_dsa_fingerprint);

                // 2. Wrap in Authenticated Transport
                let mut transport = AeadTransport::new(
                    stream,
                    *session.server_to_client_key,
                    *session.client_to_server_key,
                    session.session_id,
                    session.session_salt,
                    false,
                );

                // SEC-001: The claimed sender_id from the first valid envelope is pinned
                // for this connection. Any subsequent envelope claiming a different
                // sender_id is rejected — preventing mid-session impersonation.
                let mut pinned_sender_id: Option<String> = None;

                // 3. RPC Dispatch Loop
                loop {
                    // SEC-004: Per-frame read deadline — prevents Slowloris / hung-sender DoS.
                    let result = tokio::time::timeout(
                        tokio::time::Duration::from_secs(10),
                        transport.read_frame(),
                    ).await;

                    let frame_result = match result {
                        Ok(r) => r,
                        Err(_) => {
                            warn!(peer = %peer_addr, "Raft RPC read timeout — closing connection");
                            break;
                        }
                    };

                    match frame_result {
                        Ok(Some(bytes)) => {
                            let bytes: Vec<u8> = bytes;
                            // Deserialize Envelope
                            let envelope: RaftRpcEnvelope = match serde_json::from_slice::<
                                RaftRpcEnvelope,
                            >(
                                &bytes
                            ) {
                                Ok(env) => env,
                                Err(e) => {
                                    error!(peer = %peer_addr, err = %e, "Malformed Raft envelope");
                                    break;
                                }
                            };

                            // 1. Verify Protocol Version
                            if envelope.version != 1 {
                                error!(peer = %peer_addr, version = envelope.version, "Unsupported Raft protocol version");
                                break;
                            }

                            // 2. Verify Receiver Identity
                            if envelope.receiver_id != raft_node.id {
                                warn!(peer = %peer_addr, receiver = %envelope.receiver_id, "RPC addressed to wrong receiver");
                                break;
                            }

                            // 3. SEC-001 Sender Identity Verification
                            // a) sender_id must be non-empty
                            if envelope.sender_id.0.is_empty() {
                                error!(peer = %peer_addr, "Raft RPC missing sender identity");
                                break;
                            }

                            // b) Pin sender_id on first RPC and enforce lock for subsequent RPCs.
                            //    A connection authenticated as DSA fingerprint X must always
                            //    claim the same sender_id. Any mid-session change is an impersonation
                            //    attempt — terminate immediately.
                            match &pinned_sender_id {
                                None => {
                                    // First RPC on this connection — pin the sender_id.
                                    info!(
                                        peer = %peer_addr,
                                        sender_id = %envelope.sender_id,
                                        peer_dsa_fingerprint = %peer_fingerprint_hex,
                                        "SEC-001: Pinning sender_id to authenticated DSA fingerprint"
                                    );
                                    pinned_sender_id = Some(envelope.sender_id.0.clone());
                                }
                                Some(pinned) => {
                                    if pinned != &envelope.sender_id.0 {
                                        // Mid-session impersonation attempt detected.
                                        error!(
                                            peer = %peer_addr,
                                            claimed_id = %envelope.sender_id,
                                            pinned_id = %pinned,
                                            peer_dsa_fingerprint = %peer_fingerprint_hex,
                                            "SEC-001 VIOLATION: sender_id changed mid-session — closing connection"
                                        );
                                        break;
                                    }
                                }
                            }

                            // Dispatch based on RPC type
                            let reply_payload = match envelope.rpc_type {
                                RaftRpcType::RequestVote => {
                                    let args: RequestVoteArgs = match serde_json::from_slice::<
                                        RequestVoteArgs,
                                    >(
                                        &envelope.payload
                                    ) {
                                        Ok(a) => a,
                                        Err(e) => {
                                            error!(peer = %peer_addr, err = %e, "Malformed RequestVote args");
                                            break;
                                        }
                                    };
                                    let reply = raft_node.handle_request_vote(args).await;
                                    match serde_json::to_vec(&reply) {
                                        Ok(b) => b,
                                        Err(e) => {
                                            error!(peer = %peer_addr, err = %e, "Failed to serialize RequestVoteReply");
                                            break;
                                        }
                                    }
                                }
                                RaftRpcType::AppendEntries => {
                                    let args: AppendEntriesArgs = match serde_json::from_slice::<
                                        AppendEntriesArgs,
                                    >(
                                        &envelope.payload
                                    ) {
                                        Ok(a) => a,
                                        Err(e) => {
                                            error!(peer = %peer_addr, err = %e, "Malformed AppendEntries args");
                                            break;
                                        }
                                    };
                                    let reply = raft_node.handle_append_entries(args).await;
                                    match serde_json::to_vec(&reply) {
                                        Ok(b) => b,
                                        Err(e) => {
                                            error!(peer = %peer_addr, err = %e, "Failed to serialize AppendEntriesReply");
                                            break;
                                        }
                                    }
                                }
                            };

                            // Construct Reply Envelope
                            let reply_env = RaftRpcEnvelope {
                                version: 1,
                                rpc_type: envelope.rpc_type,
                                sender_id: raft_node.id.clone(),
                                receiver_id: envelope.sender_id,
                                request_id: envelope.request_id,
                                payload: reply_payload,
                            };
                            let reply_bytes = match serde_json::to_vec(&reply_env) {
                                Ok(b) => b,
                                Err(e) => {
                                    error!(peer = %peer_addr, err = %e, "Failed to serialize reply envelope");
                                    break;
                                }
                            };

                            // Send Encrypted Response
                            if let Err(e) = transport.write_frame(&reply_bytes).await {
                                warn!(peer = %peer_addr, err = %e, "Failed to send Raft reply");
                                break;
                            }
                        }
                        Ok(None) => {
                            info!(peer = %peer_addr, "Peer closed Raft connection");
                            break;
                        }
                        Err(e) => {
                            warn!(peer = %peer_addr, err = %e, "Transport error in Raft loop");
                            break;
                        }
                    }
                }
            });
        }
    }
}
