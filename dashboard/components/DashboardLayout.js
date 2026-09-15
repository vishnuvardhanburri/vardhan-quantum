'use client';

import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, CssBaseline, Button, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InsightsIcon from '@mui/icons-material/Insights';
import PublicIcon from '@mui/icons-material/Public';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useRouter, usePathname } from 'next/navigation';
import { useClusterStatus } from '@/lib/useApi';
import { useSSE } from '@/lib/useSSE';
import { useAuth } from '@/components/AuthProvider';

const drawerWidth = 260;

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/' },
  { text: 'Infrastructure', icon: <StorageIcon />, path: '/infrastructure' },
  { text: 'Reliability', icon: <InsightsIcon />, path: '/reliability' },
  { text: 'Security', icon: <VerifiedUserIcon />, path: '/security' },
  { text: 'Consensus', icon: <NetworkCheckIcon />, path: '/consensus' },
  { text: 'Network', icon: <PublicIcon />, path: '/network' },
  { text: 'Evidence', icon: <DisplaySettingsIcon />, path: '/evidence' },
  { text: 'Intelligence', icon: <PsychologyIcon />, path: '/intelligence' },
  { text: 'Admin', icon: <DisplaySettingsIcon />, path: '/admin' },
];

export function DashboardLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: clusterStatus, loading: clusterLoading } = useClusterStatus();
  const { connected } = useSSE(true, () => {});
  const { logout } = useAuth();

  // To avoid hydration mismatch errors with pathname
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const apiConnected = !clusterLoading && !!clusterStatus;

  const drawer = (
    <Box sx={{ height: '100%', pt: 3 }}>
      <Typography variant="h5" sx={{ px: 3, pb: 4, fontWeight: 'bold', background: 'linear-gradient(90deg, #0075FF 0%, #00C6FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        VISION PRO
      </Typography>
      <List>
        {menuItems.map((item) => {
          const isActive = mounted && pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => { router.push(item.path); setMobileOpen(false); }}
              sx={{
                mb: 1,
                mx: 2,
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(0, 117, 255, 0.15)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(0, 117, 255, 0.25)' },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#0075FF' : '#A0AEC0', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#A0AEC0'
                }}
              />
            </ListItem>
          )
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F1525' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'rgba(15, 21, 37, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#48BB78' }} />
              <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 'bold', fontSize: '0.7rem' }}>
                AUTHENTICATED
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#A0AEC0', fontSize: '0.7rem' }}>
                Control API: {apiConnected ? 'CONNECTED' : (clusterLoading ? 'CONNECTING...' : 'DISCONNECTED')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#A0AEC0', fontSize: '0.7rem' }}>
                Telemetry: {connected ? 'LIVE' : 'DISCONNECTED'}
              </Typography>
              <Box sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: connected ? '#00F5D4' : '#F56565',
                boxShadow: connected ? '0 0 8px #00F5D4' : 'none'
              }} />
            </Box>
          </Box>

          {clusterStatus?.is_leader && (
            <Chip label="Leader" color="primary" size="small" sx={{ mr: 2 }} />
          )}
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
