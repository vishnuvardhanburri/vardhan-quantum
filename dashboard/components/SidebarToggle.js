'use client';

import { Menu } from 'lucide-react';

export function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white lg:hidden"
      aria-label="Toggle navigation"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
