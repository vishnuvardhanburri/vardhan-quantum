use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::{Zeroize, Zeroizing};
use crate::ProxyError;

#[derive(Clone)]
pub struct SessionContext {
    pub session_id: [u8; 32],
    pub shared_secret: Vec<u8>,
    pub session_key: Zeroizing<[u8; 32]>,
    pub client_to_server_key: [u8; 32],
    pub server_to_client_key: [u8; 32],
}

pub fn derive_session_context(
    shared_secret: &[u8],
    transcript: &[u8],
) -> Result<SessionContext, ProxyError> {
    let hk = Hkdf::<Sha256>::new(Some(transcript), shared_secret);
    
    let mut okm = [0u8; 96];
    hk.expand(b"VARDHAN_QUANTUM_PROXY_SESSION_V2", &mut okm)
        .map_err(|_| ProxyError::CryptoError)?;
        
    let mut session_id = [0u8; 32];
    session_id.copy_from_slice(&okm[0..32]);
    let mut client_to_server_key = [0u8; 32];
    client_to_server_key.copy_from_slice(&okm[32..64]);
    let mut server_to_client_key = [0u8; 32];
    server_to_client_key.copy_from_slice(&okm[64..96]);
    
    let session_key = Zeroizing::new(client_to_server_key);
    okm.zeroize();
    
    Ok(SessionContext {
        session_id,
        shared_secret: shared_secret.to_vec(),
        session_key,
        client_to_server_key,
        server_to_client_key,
    })
}

pub fn derive_session_keys(
    shared_secret: &[u8],
    transcript: &[u8],
) -> Result<Zeroizing<[u8; 32]>, ProxyError> {
    let ctx = derive_session_context(shared_secret, transcript)?;
    Ok(ctx.session_key.clone())
}

