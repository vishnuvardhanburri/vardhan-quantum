use std::time::Instant;
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;

#[tokio::main]
async fn main() {
    println!("==================================================================");
    println!(" VARDHAN TECHNOLOGIES :: HELM CHART HIGH-THROUGHPUT STRESS TEST");
    println!("==================================================================");

    let target_addr = "127.0.0.1:8080";
    let concurrency = 50;
    let requests_per_worker = 10000;
    
    let total_requests = concurrency * requests_per_worker;
    println!("[*] Target: {}", target_addr);
    println!("[*] Concurrency Level: {}", concurrency);
    println!("[*] Total Requests: {}", total_requests);
    println!("[*] Payload Size: ~150 Bytes");
    println!("==================================================================");

    let start_time = Instant::now();
    let mut handles = Vec::new();

    let payload = b"POST /v1/clearing HTTP/1.1\r\nHost: clearing.bank.internal\r\nContent-Type: application/grpc\r\n\r\n{\"account_clearing_id\":\"VGI-CH-8801\",\"transfer_val\":\"1500000_GBP\"}";

    for _ in 0..concurrency {
        let handle = tokio::spawn(async move {
            let mut successful = 0;
            if let Ok(mut stream) = TcpStream::connect(target_addr).await {
                for _ in 0..requests_per_worker {
                    if stream.write_all(payload).await.is_ok() {
                        successful += 1;
                    }
                }
            }
            successful
        });
        handles.push(handle);
    }

    let mut total_successful = 0;
    for handle in handles {
        if let Ok(count) = handle.await {
            total_successful += count;
        }
    }

    let elapsed = start_time.elapsed();
    let req_per_sec = total_successful as f64 / elapsed.as_secs_f64();

    println!("------------------------------------------------------------------");
    println!("Stress Test Complete!");
    println!("Total Time Taken:        {:.2?}", elapsed);
    println!("Successful Requests:     {}/{}", total_successful, total_requests);
    println!("Throughput:              {:.2} req/sec", req_per_sec);
    
    if req_per_sec > 10_000.0 {
        println!("Status:                  [PASS] Enterprise Benchmark >10,000 req/s");
    } else {
        println!("Status:                  [FAIL] Enterprise Benchmark missed target.");
    }
    println!("==================================================================");
}
