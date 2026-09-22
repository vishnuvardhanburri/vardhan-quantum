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
    pub fn new(
        listen_addr: std::net::SocketAddr,
        identity: Arc<QuantumNodeIdentity>,
        raft_node: Arc<RaftNode>,
    ) -> Self {
        Self {
            listen_addr,
            identity,
            raft_node,
        }
    }

    pub async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(self.listen_addr).await?;
        info!(addr = %self.listen_addr, "Raft Network Listener active");

        loop {
            let (mut stream, peer_addr) = listener.accept().await?;
            let identity = Arc::clone(&self.identity);
            let raft_node = Arc::clone(&self.raft_node);

            tokio::spawn(async move {
                info!(peer = %peer_addr, "Incoming Raft connection");

                // 1. PQ Handshake (Responder)
                let session = match run_responder(&mut stream, &identity).await {
                    Ok(s) => s,
                    Err(e) => {
                        warn!(peer = %peer_addr, err = %e, "PQ handshake failed");
                        return;
                    }
                };

                // 2. Wrap in Authenticated Transport
                let mut transport = AeadTransport::new(
                    stream,
                    *session.server_to_client_key,
                    *session.client_to_server_key,
                    session.session_id,
                    session.session_salt,
                    false,
                );

                // 3. RPC Dispatch Loop
                loop {
                    let result = transport.read_frame().await;
                    match result {
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

                            // 3. Verify Sender Identity (Cross-check authenticated session)
                            // In a real deployment, we'd map the authenticated identity to a NodeId.
                            // For now, we verify that the sender_id is at least provided.
                            if envelope.sender_id.0.is_empty() {
                                error!(peer = %peer_addr, "Raft RPC missing sender identity");
                                break;
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
                                    serde_json::to_vec(&reply).unwrap()
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
                                    serde_json::to_vec(&reply).unwrap()
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
                            let reply_bytes = serde_json::to_vec(&reply_env).unwrap();

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
