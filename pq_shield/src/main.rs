use pq_shield::{IngressShield, IngressTelemetryEvent};
use tokio::sync::mpsc;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    let addr = "0.0.0.0:8080".parse()?;
    let key = [0x42u8; 32];
    
    let shield = IngressShield::new(addr, key);
    let (tx, mut rx) = mpsc::channel(100);

    // Consume telemetry silently to prevent blocking
    tokio::spawn(async move {
        let mut count = 0;
        while let Some(_) = rx.recv().await {
            count += 1;
            if count % 50000 == 0 {
                info!("Processed {} ingress frames", count);
            }
        }
    });

    println!("Starting pq_shield edge interceptor on {}...", addr);
    shield.run_interceptor_loop(tx).await?;
    Ok(())
}
