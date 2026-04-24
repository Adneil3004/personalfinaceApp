import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { useAuthStore } from './store/useAuthStore';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import Transactions from './views/Transactions';
import Accounts from './views/Accounts';
import Settings from './views/Settings';
import MainLayout from './components/MainLayout';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuthStore();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return session ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    console.log('App: Iniciando verificación de sesión...');
    
    // Timeout de seguridad por si Supabase no responde
    const timeout = setTimeout(() => {
      console.warn('App: Supabase getSession tardó demasiado, forzando fin de carga.');
      setLoading(false);
    }, 5000);

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('App: Sesión obtenida:', session ? 'Usuario autenticado' : 'Sin sesión');
      setAuth(session);
      setLoading(false);
      clearTimeout(timeout);
    }).catch(err => {
      console.error('App: Error al obtener sesión:', err);
      setLoading(false);
      clearTimeout(timeout);
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('App: Cambio de estado de auth:', _event, session ? 'Usuario presente' : 'Usuario ausente');
      setAuth(session);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [setAuth, setLoading]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
