'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Admin token is required');
      return;
    }
    login(token.trim());
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-[#0D0F17]/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-extrabold text-black shadow-[0_0_20px_rgba(0,245,212,0.5)] mx-auto mb-4">
            V
          </div>
          <h1 className="text-xl font-extrabold tracking-widest uppercase text-white">
            Vardhan <span className="text-[#00F5D4]">Quantum</span> Proxy
          </h1>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Enterprise CISO Control Center
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
              Admin Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter VARDHAN_ADMIN_TOKEN"
              className="w-full px-4 py-3 bg-[#05060A] border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00F5D4]/50 focus:shadow-[0_0_15px_rgba(0,245,212,0.15)] transition-all"
            />
            {error && <p className="text-red-400 text-xs font-mono mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-medium rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] hover:bg-[#00F5D4]/20 transition-all duration-300"
          >
            Authenticate &amp; Continue
          </button>
        </form>

        <p className="text-[10px] text-slate-500 font-mono text-center">
          The token is stored in-memory only and never persisted to localStorage.
        </p>
      </div>
    </main>
  );
}
