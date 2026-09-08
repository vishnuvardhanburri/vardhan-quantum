use std::time::{Instant, Duration};
use std::sync::{Arc, atomic::{AtomicUsize, Ordering}};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use core_crypto::QuantumNodeIdentity;
use proxy_engine::run_initiator;
use proxy_engine::transport::AeadTransport;

#[tokio::main(flavor = "multi_thread", worker_threads = 4)]
async fn main() {
    println!("==================================================================");
    println!(" VARDHAN TECHNOLOGIES :: SUSTAINED E2E LOAD TEST (P0 Final Gate)");
    println!("==================================================================");

    let target_addr = "127.0.0.1:8080";
    let concurrency: usize = 100; // 100 concurrent multiplexed clients
    let test_duration = Duration::from_secs(5); // 10 seconds sustained soak
    
    println!("[*] Target: {}", target_addr);
    println!("[*] Concurrency: {}", concurrency);
    println!("[*] Soak Duration: {:?}", test_duration);
    
    let payload = b"GET / HTTP/1.1\r\nHost: benchmark\r\n\r\n";
    let identity = Arc::new(QuantumNodeIdentity::generate_node_identity().unwrap());

    let successful_requests = Arc::new(AtomicUsize::new(0));
    let failed_requests = Arc::new(AtomicUsize::new(0));
    let mut handles = Vec::new();

    let start_time = Instant::now();

    for _ in 0..concurrency {
        let identity = Arc::clone(&identity);
        let succ = Arc::clone(&successful_requests);
        let fail = Arc::clone(&failed_requests);
        
        let handle = tokio::spawn(async move {
            if let Ok(mut stream) = TcpStream::connect(target_addr).await {
                // PQ Handshake (blocks here initially)
                if let Ok(session) = run_initiator(&mut stream, &identity).await {
                    let mut transport = AeadTransport::new(
                        stream,
                        session.client_to_server_key, // tx_key
                        session.server_to_client_key, // rx_key
                        session.session_id,
                        false // is_server = false
                    );
                    
                    while start_time.elapsed() < test_duration {
                        if transport.write_frame(payload).await.is_ok() {
                            if let Ok(Some(_)) = transport.read_frame().await {
                                succ.fetch_add(1, Ordering::Relaxed);
                                continue;
                            }
                        }
                        fail.fetch_add(1, Ordering::Relaxed);
                        break;
                    }
                } else {
                    fail.fetch_add(1, Ordering::Relaxed); // handshake fail
                }
            } else {
                fail.fetch_add(1, Ordering::Relaxed); // connect fail
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.await;
    }

    let elapsed = start_time.elapsed();
    let total_succ = successful_requests.load(Ordering::Relaxed);
    let total_fail = failed_requests.load(Ordering::Relaxed);
    let rps = total_succ as f64 / elapsed.as_secs_f64();

    println!("------------------------------------------------------------------");
    println!("Sustained Test Complete!");
    println!("Elapsed Time:          {:.2?}", elapsed);
    println!("Total E2E Successful:  {}", total_succ);
    println!("Total E2E Failures:    {}", total_fail);
    println!("E2E Sustained Rate:    {:.2} req/sec", rps);
    println!("==================================================================");
}
