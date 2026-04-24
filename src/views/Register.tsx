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
  CircularProgress,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { supabase } from '../services/supabase';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Opcional: Redirigir automáticamente después de unos segundos
      setTimeout(() => navigate('/login'), 5000);
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
              Crear Cuenta
            </Typography>
            <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4, color: 'text.secondary' }}>
              Únete a FinanceControl y toma el control
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                ¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta. Redirigiendo al login...
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleRegister}>
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
                  placeholder="Mínimo 6 caracteres"
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
                <TextField
                  label="Confirmar Contraseña"
                  placeholder="Repite tu contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
                </Button>
              </form>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ¿Ya tienes una cuenta?{' '}
                <Link component={RouterLink} to="/login" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                  Inicia Sesión
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
