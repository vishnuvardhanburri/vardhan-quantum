'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Server,
  BarChart3,
  FileText,
  Brain,
  Network,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { useAuth } from '@/components/AuthProvider';

const navigation = [
  {
    section: 'Control Plane',
    items: [
      { label: 'Overview', href: '/', icon: LayoutDashboard },
      { label: 'Infrastructure', href: '/infrastructure', icon: Server },
      { label: 'Consensus', href: '/consensus', icon: Network },
      { label: 'Security Posture', href: '/security', icon: Shield },
    ],
  },
  {
    section: 'Operations & Assurance',
    items: [
      { label: 'Reliability', href: '/reliability', icon: BarChart3 },
      { label: 'Evidence Explorer', href: '/evidence', icon: FileText },
      { label: 'AI Intelligence', href: '/intelligence', icon: Brain },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Administration', href: '/admin', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const showLabels = !collapsed || mobileOpen;
  const isIconOnly = !showLabels;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#060B28]/95 backdrop-blur-2xl border-r border-white/10">
      {/* Brand */}
      <div className={`flex items-center ${showLabels ? 'justify-between' : 'justify-center'} px-4 py-5 border-b border-white/10`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F5D4] via-[#0075FF] to-[#8A2BE2] flex items-center justify-center font-black text-black text-sm shadow-[0_0_20px_rgba(0,245,212,0.4)]">
            V
          </div>
          {showLabels && (
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-white font-mono">
                Vardhan <span className="text-[#00F5D4]">Quantum</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">VISION UI PRO</div>
            </div>
          )}
        </div>

        {showLabels && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
        {navigation.map((group) => (
          <div key={group.section}>
            {showLabels && (
              <span className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold block">
                {group.section}
              </span>
            )}
            <div className="space-y-1 mt-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0075FF]/30 to-[#00F5D4]/10 text-white border border-[#00F5D4]/40 shadow-[0_0_15px_rgba(0,245,212,0.15)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    } ${isIconOnly ? 'justify-center' : ''}`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00F5D4]' : 'text-slate-400'}`} />
                    {showLabels && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-white/10 ${isIconOnly ? 'text-center' : ''}`}>
        {showLabels ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-slate-400">PQC Ingress Active</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors mx-auto block"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const desktopWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:hidden w-72 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-screen lg:shrink-0 lg:transition-all lg:duration-300 ${desktopWidth}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
