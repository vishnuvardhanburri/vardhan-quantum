'use client';

import React from 'react';

export const SplitStream = ({ ciphertextStream }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Unshielded Ingress */}
      <div className="vui-card p-5 font-mono text-xs overflow-hidden flex flex-col h-64 border-[#EE5D50]/20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10 opacity-30"></div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-slate-400 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#FF0055]"></div>
            <span className="text-white font-bold uppercase tracking-wider">Legacy Plaintext Ingress (Intercepted)</span>
          </div>
          <span className="text-[#FF0055] animate-pulse font-bold text-[10px]">● VULNERABLE TO HNDL</span>
        </div>
        <div className="space-y-1.5 text-slate-300 relative z-20 flex-1 overflow-auto opacity-80 leading-relaxed text-[11px]">
          <p><span className="text-[#FFB703] font-bold">POST</span> /v1/clearing HTTP/1.1</p>
          <p className="text-slate-400">Host: clearing.bank.internal</p>
          <p className="text-slate-400">Content-Type: application/json</p>
          <p className="text-white bg-white/5 p-2 rounded-lg my-1 border border-white/5 font-mono">
            {`{"status":"SETTLED","account":"VGI-CH-8801","amount":"1500000_GBP"}`}
          </p>
          <p><span className="text-[#FFB703] font-bold">POST</span> /v1/settlement/fx HTTP/1.1</p>
          <p className="text-white bg-white/5 p-2 rounded-lg my-1 border border-white/5 font-mono">
            {`{"status":"PENDING","pair":"USD/EUR","notional":"42000000_USD"}`}
          </p>
        </div>
      </div>

      {/* RIGHT: Post-Quantum Ciphertext */}
      <div className="vui-card p-5 font-mono text-xs overflow-hidden flex flex-col h-64 border-[#00F5D4]/25">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10 opacity-30"></div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#00F5D4]/20 text-[#00F5D4] text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_10px_#00F5D4]"></div>
            <span className="text-[#00F5D4] font-bold uppercase tracking-wider">FIPS 203 / ML-KEM-1024 Enveloped Stream</span>
          </div>
          <span className="text-[#00F5D4] animate-pulse font-bold text-[10px]">● SHIELDED</span>
        </div>
        <div className="text-[#00F5D4]/90 relative z-20 flex-1 overflow-auto break-all leading-relaxed font-mono text-[11px] p-2 bg-[#00F5D4]/5 rounded-lg border border-[#00F5D4]/10">
          {ciphertextStream || 'Listening on FIPS 203 encrypted tunnel (awaiting frame transit)...'}
        </div>
      </div>
    </div>
  );
};
