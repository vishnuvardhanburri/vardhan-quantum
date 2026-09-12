'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync collapsed state to localStorage so it persists across page refreshes
  useEffect(() => {
    const saved = localStorage.getItem('vardhan-sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vardhan-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Auto-close mobile sidebar on route change would require usePathname,
  // but we handle that inside the Sidebar component on link click.

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g., in tests)
    return {
      collapsed: false,
      setCollapsed: () => {},
      mobileOpen: false,
      setMobileOpen: () => {},
    };
  }
  return ctx;
}
