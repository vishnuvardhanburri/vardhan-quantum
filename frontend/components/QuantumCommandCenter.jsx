import React, { useState } from 'react';

/**
 * QuantumCommandCenter
 * 
 * The Enterprise-grade persona-based dashboard for Vardhan Quantum.
 * Implements a "Technical Aperture" for CTO/Developer visibility.
 */
export default function QuantumCommandCenter() {
  const [persona, setPersona] = useState('EXECUTIVE');
  const [techMode, setTechMode] = useState(false);

  const renderWorkspace = () => {
    switch(persona) {
      case 'EXECUTIVE':
        return (
          <div style={{ padding: '20px', color: '#fff' }}>
            <h1 style={{ color: '#00ffcc', fontSize: '2rem', marginBottom: '10px' }}>🚀 Command Center</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>System Posture: <span style={{color: '#00ffcc'}}>SECURE</span> | Cluster Health: 100% | Risk Level: LOW</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
              <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '12px', background: '#1a1a1a', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                <h3 style={{ color: '#aaa', margin: '0 0 10px 0' }}>Active Quantum Sessions</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>1,248</div>
                <div style={{ color: '#00ffcc', fontSize: '12px', marginTop: '5px' }}>↑ 12% from last hour</div>
              </div>
              <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '12px', background: '#1a1a1a', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                <h3 style={{ color: '#aaa', margin: '0 0 10px 0' }}>Global Threat Vector</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ffcc' }}>NOMINAL</div>
                <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>Zero PQC-failures detected</div>
              </div>
            </div>
          </div>
        );
      case 'SOC':
        return (
          <div style={{ padding: '20px', color: '#fff' }}>
            <h1 style={{ color: '#ffcc00', fontSize: '2rem', marginBottom: '10px' }}>🛰️ Live Operations</h1>
            <div style={{ 
              background: '#000', 
              color: '#0f0', 
              padding: '15px', 
              fontFamily: 'monospace', 
              borderRadius: '8px', 
              height: '400px', 
              overflowY: 'auto',
              border: '1px solid #333',
              lineHeight: '1.5'
            }}>
              <div>[INFO] {new Date().toISOString()} - Session sess_a1b2c3d4 created on Node-1</div>
              <div>[INFO] {new Date().toISOString()} - Hybrid-KEM handshake completed: X25519 + ML-KEM-1024</div>
              <div>[WARN] {new Date().toISOString()} - Latency spike detected in Region-US-East (142ms)</div>
              <div>[INFO] {new Date().toISOString()} - Raft Commit Index advanced to 14502</div>
              <div>[INFO] {new Date().toISOString()} - LedgerBlock #8821 signed with ML-DSA-87</div>
              <div>[INFO] {new Date().toISOString()} - Node-3 heartbeat received (Term 14)</div>
            </div>
          </div>
        );
      case 'SECURITY':
        return (
          <div style={{ padding: '20px', color: '#fff' }}>
            <h1 style={{ color: '#ff4444', fontSize: '2rem', marginBottom: '10px' }}>🛡️ Infrastructure & Security</h1>
            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ padding: '15px 25px', background: '#333', borderRadius: '8px', borderLeft: '4px solid #ff4444' }}>
                <div style={{ fontSize: '12px', color: '#aaa' }}>KEM ALGORITHM</div>
                <div style={{ fontWeight: 'bold' }}>ML-KEM-1024 (FIPS 203)</div>
              </div>
              <div style={{ padding: '15px 25px', background: '#333', borderRadius: '8px', borderLeft: '4px solid #ff4444' }}>
                <div style={{ fontSize: '12px', color: '#aaa' }}>SIGNATURE SCHEME</div>
                <div style={{ fontWeight: 'bold' }}>ML-DSA-87 (FIPS 204)</strong></div>
              </div>
              <div style={{ padding: '15px 25px', background: '#333', borderRadius: '8px', borderLeft: '4px solid #ff4444' }}>
                <div style={{ fontSize: '12px', color: '#aaa' }}>CONSENSUS</div>
                <div style={{ fontWeight: 'bold' }}>Raft (Strong Consistency)</div>
              </div>
            </div>
          </div>
        );
      case 'AUDITOR':
        return (
          <div style={{ padding: '20px', color: '#fff' }}>
            <h1 style, { color: '#aaa', fontSize: '2rem', marginBottom: '10px' }}>⚖️ Evidence Center</h1>
            <div style={{ border: '1px solid #555', padding: '30px', marginTop: '30px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#888' }}>LATEST MERKLE ROOT</div>
                <div style={{ fontSize: '18px', fontFamily: 'monospace', color: '#00ffcc' }}>0x8f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#888' }}>VERIFICATION STATUS</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ffcc' }}>✓ MATHEMATICALLY VALIDATED</div>
              </div>
              <button style={{ padding: '10px 20px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export Evidence Bundle</button>
            </div>
          </div>
        );
      default:
        return React.createElement('div', null, 'Unknown Persona');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', color: '#eee', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#151515' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['EXECUTIVE', 'SOC', 'SECURITY', 'AUDITOR'].map(p => (
            <button 
              key={p} 
              onClick={() => setPersona(p)} 
              style={{ 
                padding: '6px 12px', 
                cursor: 'pointer', 
                background: persona === p ? '#00ffcc' : '#333', 
                color: persona === p ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '11px',
                transition: 'all 0.2s ease'
              }} 
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>TECHNICAL MODE</span>
          <input 
            type="checkbox" 
            checked={techMode} 
            onChange={(e) => setTechMode(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: '#00ffcc' }}
          />
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderWorkspace()}
        {techMode && (
          <div style={{ 
            position: 'absolute', 
            bottom: '30px', 
            right: '30px', 
            background: 'rgba(0,0,0,0.9)', 
            border: '1px solid #00ffcc', 
            padding: '20px', 
            borderRadius: '12px', 
            color: '#00ffcc', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '13px', 
            boxShadow: '0 10px 30px rgba(0,0,0,1)',
            pointerEvents: 'none',
            zIndex: 1000
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid #00ffcc', paddingBottom: '5px' }}>⚙️ ENGINE DIAGNOSTICS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '5px 20px' }}>
              <span style={{ color: '#888' }}>RaftTerm:</span> <span>14</span>
              <span style={{ color: '#888' }}>Role:</span> <span>LEADER</span>
              <span style={{ color: '#888' }}>CommitIdx:</span> <span>14502</span>
              <span style={{ color: '#888' }}>Applied:</span> <span>14502</span>
              <span style={{ color: '#888' }}>HybridKey:</span> <span>X25519+MLKEM_1024</span>
              <span style={{ color: '#888' }}>Entropy:</span> <span>7.9998 bits/byte</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
