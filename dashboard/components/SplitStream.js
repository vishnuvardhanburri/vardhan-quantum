'use client';

import React from 'react';

export const SplitStream = ({ ciphertextStream }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* LEFT: Unshielded Ingress */}
      <div className="relative rounded-xl bg-[#05060A] border border-white/10 p-4 font-mono text-xs overflow-hidden shadow-2xl flex flex-col h-64">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10 opacity-40"></div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-slate-500 text-[11px]">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 glow-crimson"></div>
            <span className="text-slate-400 uppercase tracking-widest">Legacy Plaintext Ingress (Intercepted)</span>
          </div>
          <span className="text-[#FF0055]/80 animate-pulse font-bold">● VULNERABLE TO HNDL</span>
        </div>
        <div className="space-y-1 text-slate-300 relative z-20 flex-1 overflow-auto opacity-80 leading-relaxed">
          <p><span className="text-[#FFB703]">POST</span> /v1/clearing HTTP/1.1</p>
          <p>Host: clearing.bank.internal</p>
          <p>Content-Type: application/json</p>
          <p className="text-white bg-white/5 p-2 rounded my-2">{"{"}"status":"SETTLED","account":"VGI-CH-8801","amount":"1500000_GBP"{"}"}</p>
          <p><span className="text-[#FFB703]">POST</span> /v1/clearing HTTP/1.1</p>
          <p className="text-white bg-white/5 p-2 rounded my-2">{"{"}"status":"SETTLED","account":"VGI-CH-8802","amount":"250000_GBP"{"}"}</p>
        </div>
      </div>

      {/* RIGHT: Post-Quantum Ciphertext */}
      <div className="relative rounded-xl bg-[#05060A] border border-[#00F5D4]/30 p-4 font-mono text-xs overflow-hidden shadow-2xl flex flex-col h-64 glow-teal">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10 opacity-40"></div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#00F5D4]/20 text-[#00F5D4] text-[11px]">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4]/80 glow-teal"></div>
            <span className="text-[#00F5D4] uppercase tracking-widest">FIPS 203 / ML-KEM-1024 Enveloped Stream</span>
          </div>
          <span className="text-[#00F5D4]/80 animate-pulse font-bold">● SECURED</span>
        </div>
        <div className="text-[#00F5D4]/80 relative z-20 flex-1 overflow-auto break-all leading-relaxed font-mono opacity-90">
          {ciphertextStream}
        </div>
      </div>
    </div>
  );
};
