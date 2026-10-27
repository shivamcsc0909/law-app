import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  AlertTriangle,
  Scale,
  Bell,
  LogOut
} from 'lucide-react';
import { DashboardPage } from './pages/DashboardPage';
import { VerificationsPage } from './pages/VerificationsPage';
import { UsersPage } from './pages/UsersPage';
import { ModerationPage } from './pages/ModerationPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B1426',
      paper: '#0F172A',
    },
    primary: {
      main: '#D4AF37',
    },
    secondary: {
      main: '#38BDF8',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  },
});

const DRAWER_WIDTH = 260;

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'verifications' | 'users' | 'moderation'>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'verifications', label: 'Bar Verifications', icon: <ShieldCheck size={20} />, badge: 'Pending' },
    { id: 'users', label: 'Users & Advocates', icon: <Users size={20} /> },
    { id: 'moderation', label: 'Content Moderation', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            ml: `${DRAWER_WIDTH}px`,
            backgroundColor: '#0F172A',
            borderBottom: '1px solid #1E293B',
            boxShadow: 'none'
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                NyayaSetu Command Center
              </Typography>
              <Chip
                label="Hostinger Live API"
                size="small"
                sx={{ backgroundColor: '#10B98122', color: '#10B981', fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small" sx={{ color: '#94A3B8' }}>
                <Bell size={20} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#D4AF37', color: '#0B1426', fontWeight: 700 }}>
                  AD
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: '#F8FAFC', fontWeight: 600, display: 'block' }}>
                    Super Admin
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                    admin@nyayasetu.in
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#070D18',
              borderRight: '1px solid #1E293B'
            },
          }}
        >
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #1E293B' }}>
            <Box sx={{ p: 1, borderRadius: 2, backgroundColor: '#1E293B', color: '#D4AF37' }}>
              <Scale size={24} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px' }}>
                NyayaSetu
              </Typography>
              <Typography variant="caption" sx={{ color: '#D4AF37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Admin Portal
              </Typography>
            </Box>
          </Box>

          <List sx={{ px: 1.5, py: 2 }}>
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setCurrentTab(item.id as any)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: active ? '#1E293B' : 'transparent',
                      color: active ? '#D4AF37' : '#94A3B8',
                      '&:hover': { backgroundColor: '#1E293B', color: '#F8FAFC' },
                    }}
                  >
                    <ListItemIcon sx={{ color: active ? '#D4AF37' : '#94A3B8', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}
                    />
                    {item.badge && (
                      <Chip label={item.badge} size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#F59E0B22', color: '#F59E0B', fontWeight: 600 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #1E293B' }}>
            <Box sx={{ p: 1.5, backgroundColor: '#0F172A', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontWeight: 600 }}>
                India Legal Ecosystem
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                v1.0.0 • Production Ready
              </Typography>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content View */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3.5,
            mt: 8,
            backgroundColor: '#0B1426',
            minHeight: '100vh',
            maxWidth: '100%'
          }}
        >
          {currentTab === 'dashboard' && <DashboardPage onNavigateTab={(tab) => setCurrentTab(tab as any)} />}
          {currentTab === 'verifications' && <VerificationsPage />}
          {currentTab === 'users' && <UsersPage />}
          {currentTab === 'moderation' && <ModerationPage />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default App;
