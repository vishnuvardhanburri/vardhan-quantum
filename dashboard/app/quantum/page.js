'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Key, Shield, Lock, Zap } from 'lucide-react';

export default function QuantumSecurityPage() {
  return (
    <DashboardLayout title="Quantum Security">
      <div className="space-y-8">
        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Post-Quantum Cryptographic Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm text-white font-medium mb-3">Key Encapsulation</h3>
              <ul className="space-y-2 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-slate-400">Algorithm</span>
                  <span className="text-white">ML-KEM-1024 (FIPS 203)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Key Size</span>
                  <span className="text-[#00F5D4]">1,568 bytes</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Ciphertext</span>
                  <span className="text-[#00F5D4]">1,568 bytes</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm text-white font-medium mb-3">Digital Signatures</h3>
              <ul className="space-y-2 text-xs font-mono">
                <li className="flex justify-between">
                  <span className="text-slate-400">Algorithm</span>
                  <span className="text-white">ML-DSA-87 (FIPS 204)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Signature Size</span>
                  <span className="text-[#00F5D4]">4,627 bytes</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Public Key</span>
                  <span className="text-[#00F5D4]">2,592 bytes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="panel rounded-xl p-6 shadow-card">
          <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Key Protection
          </h2>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Production: KMS/HSM (AWS KMS or PKCS#11). Development: local KEK.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Mode</span>
              <span className="text-lg font-bold text-[#00F5D4] block mt-1">DEVELOPMENT</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Vault</span>
              <span className="text-lg font-bold text-white block mt-1">pq_vault.json</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Protection</span>
              <span className="text-lg font-bold text-emerald-400 block mt-1">KEK (AES-256-GCM)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
