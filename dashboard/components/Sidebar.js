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
  Users,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { useAuth } from '@/components/AuthProvider';

const navigation = [
  {
    section: 'Control Plane',
    items: [
      { label: 'Overview', href: '/', icon: LayoutDashboard },
      { label: 'Security Operations', href: '/security', icon: Shield },
      { label: 'Quantum Security', href: '/quantum', icon: Shield },
    ],
  },
  {
    section: 'Systems',
    items: [
      { label: 'Infrastructure', href: '/infrastructure', icon: Server },
      { label: 'Reliability', href: '/reliability', icon: BarChart3 },
    ],
  },
  {
    section: 'Assurance',
    items: [
      { label: 'Evidence Explorer', href: '/evidence', icon: FileText },
      { label: 'AI Decisions', href: '/ai-decisions', icon: Brain },
    ],
  },
  {
    section: 'Identity',
    items: [
      { label: 'Login Activity', href: '/sessions', icon: Users },
      { label: 'Active Sessions', href: '/sessions/active', icon: Users },
    ],
  },
  {
    section: 'Manage',
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
    if (window.innerWidth < 1024 && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const SidebarContent = () => {
    const showLabels = !collapsed || mobileOpen;
    const isIconOnly = !showLabels;

    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className={`flex items-center ${showLabels ? 'justify-between' : 'justify-center'} p-4 border-b border-panel`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5D4] to-[#8A2BE2] flex items-center justify-center font-extrabold text-black text-sm shadow-[0_0_15px_rgba(0,245,212,0.3)]">
              V
            </div>
            {showLabels && (
              <div>
                <span className="text-xs font-bold text-white uppercase">Vardhan</span>
                <span className="text-xs text-[#00F5D4] block">Quantum</span>
              </div>
            )}
          </div>
          {showLabels && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Collapse sidebar"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6">
          {navigation.map((group) => (
            <div key={group.section}>
              {showLabels && (
                <span className="px-4 py-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  {group.section}
                </span>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const isIconOnly = !showLabels;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      } ${isIconOnly ? 'justify-center' : ''}`}
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F5D4]' : 'text-slate-400'}`} />
                      {showLabels && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-panel ${isIconOnly ? 'text-center' : ''}`}>
          {showLabels ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-400 mx-auto" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const desktopWidth = collapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:hidden w-64 bg-surface-elev border-r border-panel transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-screen lg:overflow-y-auto lg:bg-surface-elev lg:border-r lg:border-panel lg:transition-all lg:duration-200 ${desktopWidth}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
