import { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  useTheme,
  Button,
  Drawer,
  Toolbar,
  Divider,
  AppBar,
  IconButton,
} from '@mui/material';
import { 
  Logout, 
  Dashboard as DashboardIcon,
  ReceiptLong,
  AccountBalance as AccountsIcon,
  Settings,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transacciones', icon: <ReceiptLong />, path: '/transactions' },
    { text: 'Cuentas', icon: <AccountsIcon />, path: '/accounts' },
    { text: 'Configuración', icon: <Settings />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="img" src="/logo.png" sx={{ width: 32, height: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Manrope' }}>
            FinanceControl
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Box 
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{ 
                mb: 1,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: isActive ? `${theme.palette.primary.main}15` : 'transparent',
                color: isActive ? theme.palette.primary.main : 'text.primary',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: `${theme.palette.primary.main}10` }
              }}
            >
              <Box sx={{ display: 'flex', color: isActive ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </Box>
              <Typography sx={{ fontWeight: isActive ? 600 : 400 }}>
                {item.text}
              </Typography>
            </Box>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="inherit" 
          startIcon={<Logout />} 
          onClick={signOut}
          sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar para Mobile */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { sm: 'none' }, 
          bgcolor: 'rgba(17, 25, 39, 0.8)', 
          backdropFilter: 'blur(10px)',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          pt: 'env(safe-area-inset-top)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, fontFamily: 'Manrope', flexGrow: 1 }}>
            FinanceControl
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar para Desktop */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              bgcolor: 'background.paper', 
              backgroundImage: 'none',
              pt: 'env(safe-area-inset-top)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.05)', backgroundImage: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, md: 4 }, 
        width: { sm: `calc(100% - ${drawerWidth}px)` }, 
        overflowY: 'auto', 
        maxHeight: '100vh',
        mt: { xs: 'calc(56px + env(safe-area-inset-top))', sm: 0 },
        pt: { xs: 2, sm: 0 }
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
