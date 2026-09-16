'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Shield, Server, BarChart3, FileText,
  Brain, Settings, LogOut, X, Network, Cpu, ChevronRight,
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { useAuth } from '@/components/AuthProvider';

const navigation = [
  {
    section: 'CONTROL PLANE',
    items: [
      { label: 'Overview',          href: '/',              icon: LayoutDashboard, color: 'teal' },
      { label: 'Security Ops',      href: '/security',      icon: Shield,          color: 'purple' },
      { label: 'Consensus (Raft)',   href: '/consensus',     icon: Cpu,             color: 'purple' },
    ],
  },
  {
    section: 'SYSTEMS',
    items: [
      { label: 'Infrastructure',    href: '/infrastructure', icon: Server,    color: 'blue' },
      { label: 'Reliability',       href: '/reliability',    icon: BarChart3, color: 'teal' },
      { label: 'Network',           href: '/network',        icon: Network,   color: 'blue' },
    ],
  },
  {
    section: 'ASSURANCE',
    items: [
      { label: 'Evidence Explorer', href: '/evidence',      icon: FileText, color: 'purple' },
      { label: 'AI Intelligence',   href: '/intelligence',  icon: Brain,    color: 'teal' },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { label: 'Administration',    href: '/admin',         icon: Settings, color: 'purple' },
    ],
  },
];

const iconBgActive = {
  teal:   'bg-gradient-to-br from-[#00F5D4]/20 to-[#007A6A]/10 border border-[#00F5D4]/25',
  purple: 'bg-gradient-to-br from-[#8A2BE2]/25 to-[#3D0080]/10 border border-[#8A2BE2]/25',
  blue:   'bg-gradient-to-br from-[#0075FF]/20 to-[#002080]/10 border border-[#0075FF]/25',
};
const iconColorActive = { teal: 'text-[#00F5D4]', purple: 'text-[#A855F7]', blue: 'text-[#60A5FA]' };

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    const showLabels = !collapsed || isMobile;
    return (
      <div className="flex flex-col h-full">
        <div className={`flex items-center ${showLabels ? 'justify-between' : 'justify-center'} px-5 py-6`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F5D4] via-[#0075FF] to-[#8A2BE2] flex items-center justify-center font-black text-black text-sm shadow-[0_0_20px_rgba(0,245,212,0.4)]">
                V
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#01B574] border-2 border-[#090D2E] shadow-[0_0_8px_#01B574]" />
            </div>
            {showLabels && (
              <div className="min-w-0">
                <p className="text-[13px] font-black text-white tracking-wide leading-none">VARDHAN</p>
                <p className="text-[11px] font-semibold text-[#00F5D4] tracking-widest leading-none mt-0.5">QUANTUM</p>
              </div>
            )}
          </div>
          {showLabels && !isMobile && (
            <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-lg text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors shrink-0" aria-label="Collapse">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-[#A0AEC0] hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="mx-4 mb-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
          {navigation.map((group) => (
            <div key={group.section}>
              {showLabels && (
                <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.15em] text-[#5A5F73] uppercase">{group.section}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      title={showLabels ? undefined : item.label}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'nav-active' : 'hover:bg-white/[0.04]'} ${!showLabels ? 'justify-center' : ''}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? iconBgActive[item.color] : 'bg-white/[0.04] group-hover:bg-white/[0.07]'}`}>
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? iconColorActive[item.color] : 'text-[#5A5F73] group-hover:text-[#A0AEC0]'}`} />
                      </div>
                      {showLabels && (
                        <span className={`text-[13px] font-semibold transition-colors flex-1 ${isActive ? 'text-white' : 'text-[#A0AEC0] group-hover:text-white'}`}>
                          {item.label}
                        </span>
                      )}
                      {showLabels && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#A0AEC0] shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-4 mb-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {showLabels ? (
          <div className="px-3 pb-5">
            <div className="vui-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-black text-black text-sm shrink-0 shadow-[0_0_15px_rgba(0,245,212,0.25)]">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">Admin</p>
                <p className="text-[10px] text-[#A0AEC0] truncate font-mono">CISO · SUPER_ADMIN</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg text-[#A0AEC0] hover:text-[#EE5D50] hover:bg-[#EE5D50]/10 transition-all" title="Logout">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-3 pb-5 flex justify-center">
            <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#A0AEC0] hover:text-[#EE5D50] hover:bg-[#EE5D50]/10 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const desktopWidth = collapsed ? 'w-[70px]' : 'w-[240px]';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 lg:hidden w-[240px] sidebar-bg border-r border-white/[0.07] transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent isMobile={true} />
      </aside>
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed left-[70px] top-1/2 -translate-y-1/2 z-50 w-5 h-10 items-center justify-center bg-[#0F123B] border border-white/10 rounded-r-lg text-[#A0AEC0] hover:text-white shadow-lg"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
      <aside className={`hidden lg:flex lg:flex-col lg:h-screen lg:overflow-hidden sidebar-bg border-r border-white/[0.07] transition-all duration-300 ease-in-out shrink-0 ${desktopWidth}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
