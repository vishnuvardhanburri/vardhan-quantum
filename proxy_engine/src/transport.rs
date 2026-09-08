use std::io;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use bytes::{Buf, BufMut, BytesMut};
use aes_gcm::{aead::{Aead, KeyInit, Payload}, Aes256Gcm, Key, Nonce};
use crate::ProxyError;
use zeroize::Zeroize;

const MAX_FRAME_SIZE: usize = 65_536;

pub struct AeadTransport {
    stream: TcpStream,
    tx_key: [u8; 32],
    rx_key: [u8; 32],
    session_id: [u8; 32],
    direction_marker: u8, // 1 for Server, 0 for Client
    tx_seq: u64,
    rx_seq: u64,
    read_buf: BytesMut,
}

impl AeadTransport {
    pub fn new(stream: TcpStream, tx_key: [u8; 32], rx_key: [u8; 32], session_id: [u8; 32], is_server: bool) -> Self {
        Self {
            stream,
            tx_key,
            rx_key,
            session_id,
            direction_marker: if is_server { 0x01 } else { 0x00 },
            tx_seq: 0,
            rx_seq: 0,
            read_buf: BytesMut::with_capacity(MAX_FRAME_SIZE * 2),
        }
    }

    fn build_aad(&self, is_tx: bool, seq: u64, payload_len: u32) -> Vec<u8> {
        let mut aad = Vec::with_capacity(32 + 1 + 8 + 4 + 4);
        aad.extend_from_slice(&self.session_id); // 32 bytes session identifier
        let dir = if is_tx { self.direction_marker } else { 1 - self.direction_marker };
        aad.push(dir);         // 1 byte direction
        aad.extend_from_slice(&seq.to_be_bytes()); // 8 byte sequence number
        aad.extend_from_slice(b"V1.0");          // 4 byte protocol version
        aad.extend_from_slice(&payload_len.to_be_bytes()); // bind length
        aad
    }

    fn build_nonce(&self, is_tx: bool, seq: u64) -> [u8; 12] {
        let mut nonce = [0u8; 12];
        let dir = if is_tx { self.direction_marker } else { 1 - self.direction_marker };
        // 1 byte direction, 3 bytes zero padding, 8 bytes sequence number
        nonce[0] = dir;
        nonce[4..12].copy_from_slice(&seq.to_be_bytes());
        nonce
    }

    pub async fn write_frame(&mut self, data: &[u8]) -> Result<(), ProxyError> {
        if data.len() > MAX_FRAME_SIZE {
            return Err(ProxyError::FrameTooLarge(data.len()));
        }
        
        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.tx_key));
        let nonce_bytes = self.build_nonce(true, self.tx_seq);
        let nonce = Nonce::from_slice(&nonce_bytes);
        let aad = self.build_aad(true, self.tx_seq, data.len() as u32);
        
        let payload = Payload {
            msg: data,
            aad: &aad,
        };
        
        let ciphertext = cipher.encrypt(nonce, payload).map_err(|_| ProxyError::CryptoError)?;
        
        let mut header = [0u8; 4];
        header.copy_from_slice(&(ciphertext.len() as u32).to_be_bytes());
        
        self.stream.write_all(&header).await?;
        self.stream.write_all(&ciphertext).await?;
        
        self.tx_seq = self.tx_seq.checked_add(1).ok_or(ProxyError::CryptoError)?; // Prevent overflow
        Ok(())
    }

    pub async fn read_frame(&mut self) -> Result<Option<Vec<u8>>, ProxyError> {
        loop {
            if self.read_buf.len() >= 4 {
                let mut len_bytes = [0u8; 4];
                len_bytes.copy_from_slice(&self.read_buf[..4]);
                let frame_len = u32::from_be_bytes(len_bytes) as usize;
                
                if frame_len > MAX_FRAME_SIZE + 16 { // Account for GCM tag
                    return Err(ProxyError::FrameTooLarge(frame_len));
                }
                
                if self.read_buf.len() >= 4 + frame_len {
                    self.read_buf.advance(4);
                    let ciphertext = self.read_buf.split_to(frame_len).to_vec();
                    
                    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.rx_key));
                    let nonce_bytes = self.build_nonce(false, self.rx_seq);
                    let nonce = Nonce::from_slice(&nonce_bytes);
                    let expected_pt_len = (frame_len.saturating_sub(16)) as u32;
                    let aad = self.build_aad(false, self.rx_seq, expected_pt_len);
                    
                    let payload = Payload {
                        msg: &ciphertext,
                        aad: &aad,
                    };
                    
                    let plaintext = cipher.decrypt(nonce, payload).map_err(|_| ProxyError::CryptoError)?;
                    
                    self.rx_seq = self.rx_seq.checked_add(1).ok_or(ProxyError::CryptoError)?;
                    return Ok(Some(plaintext));
                }
            }
            
            let mut chunk = [0u8; 8192];
            match self.stream.read(&mut chunk).await {
                Ok(0) => {
                    if self.read_buf.is_empty() {
                        return Ok(None);
                    } else {
                        return Err(ProxyError::Io(io::Error::new(io::ErrorKind::UnexpectedEof, "Incomplete AEAD frame")));
                    }
                }
                Ok(n) => {
                    self.read_buf.extend_from_slice(&chunk[..n]);
                }
                Err(e) => return Err(ProxyError::Io(e)),
            }
        }
    }
}
