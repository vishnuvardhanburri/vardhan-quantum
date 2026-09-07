'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { SplitStream } from '@/components/SplitStream';
import { ComplianceFeed, AuditEvent } from '@/components/ComplianceFeed';

export default function DashboardPage() {
  const [tps, setTps] = useState(260465);
  const [entropy, setEntropy] = useState(7.9982);
  const [ciphertext, setCiphertext] = useState(
    '4f8a92b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c61a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  );

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      timestamp: 1725740451,
      mandate: 'DORA_ART_9_2_CRYPTOGRAPHIC_SHIELD',
      primitive: 'FIPS 203 (ML-KEM-1024)',
      entropy: '7.9984 bits',
      status: 'OK',
    },
    {
      timestamp: 1725740451,
      mandate: 'NIS2_ART_21_2_QUANTUM_AGILITY',
      primitive: 'FIPS 204 (ML-DSA-87)',
      entropy: '7.9982 bits',
      status: 'OK',
    },
    {
      timestamp: 1725740452,
      mandate: 'DORA_ART_9_2_CRYPTOGRAPHIC_SHIELD',
      primitive: 'FIPS 203 (ML-KEM-1024)',
      entropy: '7.9991 bits',
      status: 'OK',
    },
  ]);

  // Simulate Live High-Density Telemetry Stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate TPS slightly
      setTps((prev) => prev + Math.floor(Math.random() * 200 - 100));

      // Fluctuate Entropy score
      setEntropy((7.9980 + Math.random() * 0.0015));

      // Generate random hex block for lattice stream animation
      const randomHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setCiphertext((prev) => randomHex + prev.substring(0, 120));

      // Append new compliance trace periodically
      if (Math.random() > 0.6) {
        const newEvent: AuditEvent = {
          timestamp: Math.floor(Date.now() / 1000),
          mandate:
            Math.random() > 0.5
              ? 'DORA_ART_9_2_CRYPTOGRAPHIC_SHIELD'
              : 'NIS2_ART_21_2_QUANTUM_AGILITY',
          primitive:
            Math.random() > 0.5 ? 'FIPS 203 (ML-KEM-1024)' : 'FIPS 204 (ML-DSA-87)',
          entropy: `${(7.9980 + Math.random() * 0.0018).toFixed(4)} bits`,
          status: 'OK',
        };

        setAuditEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleExportPdf = () => {
    alert('Triggering Rust poc_auditor backend to compile signed DORA PDF certificate...');
  };

  return (
    <main className="max-w-7xl mx-auto">
      {/* Header */}
      <Header
        nodeId="QNI_3f7a...c6d7"
        quorumStatus="2/3+1 Quorum"
        onExport={handleExportPdf}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Ingress TPS"
          badge="ACTIVE"
          value={tps.toLocaleString()}
          unit="req/s"
          subtitle="↑ +99.98% vs unshielded HTTP baseline"
          glowColor="teal"
        />
        <MetricCard
          title="Shannon Entropy"
          badge="HNDL IMPERVIOUS"
          value={entropy.toFixed(4)}
          unit="/ 8.0"
          subtitle="Maximum theoretical randomness active"
          glowColor="purple"
        />
        <MetricCard
          title="FIPS 203 / ML-KEM-1024"
          badge="LATTICE CIPHER"
          value="SHIELDED"
          subtitle="In-Flight PQ Re-Encryptor Running"
          glowColor="teal"
        />
      </div>

      {/* Live Split Interception Stream */}
      <SplitStream ciphertextStream={ciphertext} />

      {/* Real-time Compliance Feed */}
      <ComplianceFeed events={auditEvents} />
    </main>
  );
}
