import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message);
      setLoading(false);
    } else {
      setAuth(data.session);
      navigate('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Card 
          elevation={0} 
          sx={{ 
            width: '100%', 
            p: { xs: 2, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Project Logo */}
          <Box sx={{ 
            position: 'absolute',
            top: -50,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 100,
            height: 100,
            borderRadius: '24px',
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '2px solid',
            borderColor: 'primary.main',
            overflow: 'hidden'
          }}>
            <Box 
              component="img"
              src="/logo.png"
              sx={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              alt="FinanceControl Logo"
            />
          </Box>

          <CardContent sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              FinanceControl
            </Typography>
            <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4, color: 'text.secondary' }}>
              Gestión inteligente de tus finanzas
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <TextField
                label="Contraseña"
                placeholder="Tu contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ 
                  mt: 4, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 14px 0 rgba(77, 171, 245, 0.39)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
