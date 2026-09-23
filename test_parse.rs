use serde_json::Value;

fn main() {
    let raw = "{\"mac\":\"c7e46\",\"payload_json\":\"{\\\"current_term\\\":1,\\\"voted_for\\\":null,\\\"log\\\":[{\\\"term\\\":1,\\\"index\\\":1,\\\"client_id\\\":\\\"client-c9e2b102-1\\\",\\\"request_id\\\":\\\"req-0-1\\\",\\\"data\\\":[112,97,121,108,111,97,100,45,48,45,49]}],\\\"commit_index\\\":0,\\\"cluster_id\\\":\\\"\\\",\\\"config_epoch\\\":1}\"}";
    let mut parsed: Value = serde_json::from_str(raw).unwrap();
    if let Some(payload) = parsed.get("payload_json") {
        parsed = serde_json::from_str(payload.as_str().unwrap()).unwrap();
    }
    let log_arr = parsed["log"].as_array().expect("Log must be array");
    println!("Log length: {}", log_arr.len());
}
