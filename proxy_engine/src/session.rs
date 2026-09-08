use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::Zeroize;
use crate::ProxyError;

pub struct SessionContext {
    pub session_id: [u8; 32],
    pub client_to_server_key: [u8; 32],
    pub server_to_client_key: [u8; 32],
}

impl Drop for SessionContext {
    fn drop(&mut self) {
        self.session_id.zeroize();
        self.client_to_server_key.zeroize();
        self.server_to_client_key.zeroize();
    }
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
    
    okm.zeroize();
    
    Ok(SessionContext {
        session_id,
        client_to_server_key,
        server_to_client_key,
    })
}
