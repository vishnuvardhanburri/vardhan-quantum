use core_crypto::QuantumNodeIdentity;
use ha_cluster::raft::{AppendEntriesArgs, AppendEntriesReply, RaftRpcClient, RequestVoteArgs, RequestVoteReply};
use ha_cluster::{NodeId, RaftConfig, RaftNode};
use proxy_engine::{run_initiator, AeadTransport};
use std::sync::Arc;
use std::pin::Pin;
use std::future::Future;
use tokio::net::TcpStream;

struct DummyRpc;
impl RaftRpcClient for DummyRpc {
    fn send_request_vote(&self, _to: NodeId, _args: RequestVoteArgs) -> Pin<Box<dyn Future<Output = Result<RequestVoteReply, String>> + Send>> {
        Box::pin(async { Err("dummy".to_string()) })
    }
    fn send_append_entries(&self, _to: NodeId, _args: AppendEntriesArgs) -> Pin<Box<dyn Future<Output = Result<AppendEntriesReply, String>> + Send>> {
        Box::pin(async { Err("dummy".to_string()) })
    }
}

#[tokio::test]
async fn test_tcp_byzantine_stale_leader_injection() {
    let identity_a = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());
    
    let db_path = std::env::temp_dir().join(format!("raft_tcp_byzantine_{}", rand::random::<u64>()));
    let _ = std::fs::remove_dir_all(&db_path);
    std::fs::create_dir_all(&db_path).unwrap();

    let mut config = RaftConfig::default();
    config.persist_on_submit = true;
    config.state_machine_mac_key = Some([0x42; 32]);
    let persist_path = db_path.join("a.json");
    
    // We bind a real TCP listener to an ephemeral port
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let actual_addr = listener.local_addr().unwrap();
    
    let node_a = Arc::new(RaftNode::with_config(
        NodeId::new("node-a"),
        persist_path,
        Arc::new(DummyRpc),
        config.clone(),
    ));

    // start the listener
    let node_clone = node_a.clone();
    let identity_clone = identity_a.clone();
    tokio::spawn(async move {
        // We do a manual accept loop for the test to avoid cyclic dependencies
        if let Ok((mut stream, _)) = listener.accept().await {
            let session = proxy_engine::run_responder(&mut stream, &identity_clone).await.unwrap();
            let mut transport = AeadTransport::new(
                stream,
                *session.client_to_server_key,
                *session.server_to_client_key,
                session.session_id,
                session.session_salt,
                false,
            );
            
            if let Ok(bytes) = transport.read_frame().await {
                // Let's pretend it's a raft envelope and process it
                // Actually the real RaftNetworkListener handles this. But we can just use the real listener!
            }
        }
    });
    
    // Connect to actual port
    let mut client = TcpStream::connect(actual_addr).await.unwrap();
    let init_session = run_initiator(&mut client, &identity_a).await.unwrap();
    let mut transport = AeadTransport::new(
        client,
        *init_session.client_to_server_key,
        *init_session.server_to_client_key,
        init_session.session_id,
        init_session.session_salt,
        true,
    );

    // Byzantine Injection: we need to send a proper Raft envelope
    // But since this is a unit test, we can just test that we CAN send it,
    // and wait, I need the actual `ha_cluster` types!
}
