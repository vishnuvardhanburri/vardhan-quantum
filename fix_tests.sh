#!/bin/bash
for file in backend/ha_cluster/tests/*.rs; do
  # Replace the messy sed with a cleaner multi-line parse
  sed -i '' 's/let env: serde_json::Value = serde_json::from_str(\&content).unwrap(); let payload = env\["payload_json"\].as_str().unwrap_or(\&content); let state: RaftPersistentState = serde_json::from_str(payload)/let payload = if let Ok(env) = serde_json::from_str::<ha_cluster::raft::SecureEnvelope>(\&content) { env.payload_json } else { content.clone() }; let state: RaftPersistentState = serde_json::from_str(\&payload)/g' $file
  
  sed -i '' 's/let env: serde_json::Value = serde_json::from_str(\&persist_content).unwrap(); let payload = env\["payload_json"\].as_str().unwrap_or(\&persist_content); let persisted_state: RaftPersistentState = serde_json::from_str(payload).unwrap();/let payload = if let Ok(env) = serde_json::from_str::<ha_cluster::raft::SecureEnvelope>(\&persist_content) { env.payload_json } else { persist_content.clone() }; let persisted_state: RaftPersistentState = serde_json::from_str(\&payload).unwrap();/g' $file
  
  sed -i '' 's/let env: serde_json::Value = serde_json::from_str(\&persisted).unwrap(); let payload = env\["payload_json"\].as_str().unwrap_or(\&persisted); let state: ha_cluster::raft::RaftPersistentState = serde_json::from_str(payload).unwrap();/let payload = if let Ok(env) = serde_json::from_str::<ha_cluster::raft::SecureEnvelope>(\&persisted) { env.payload_json } else { persisted.clone() }; let state: ha_cluster::raft::RaftPersistentState = serde_json::from_str(\&payload).unwrap();/g' $file

  sed -i '' 's/let env: serde_json::Value = serde_json::from_str(\&content).unwrap_or(serde_json::Value::Null); let payload = env\["payload_json"\].as_str().unwrap_or(\&content); if let Ok(state) = serde_json::from_str::<ha_cluster::raft::RaftPersistentState>(payload) {/let payload = if let Ok(env) = serde_json::from_str::<ha_cluster::raft::SecureEnvelope>(\&content) { env.payload_json } else { content.clone() }; if let Ok(state) = serde_json::from_str::<ha_cluster::raft::RaftPersistentState>(\&payload) {/g' $file
done
