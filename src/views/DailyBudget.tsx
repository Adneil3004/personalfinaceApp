import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { api, type DailyBudgetStats } from '../services/api';
import {
  AccountBalanceWallet,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Edit,
  InfoOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlighted?: boolean;
  statusText?: string;
}

const SummaryCard = ({ title, value, icon, color, highlighted = false, statusText }: SummaryCardProps) => {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} style={{ height: '100%', width: '100%' }}>
      <Card sx={{
        height: '100%',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        border: highlighted ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        background: highlighted
          ? 'linear-gradient(135deg, #316ee9 0%, #0F1B4C 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: highlighted 
          ? '0 8px 32px rgba(49,110,233,0.25)' 
          : `0 8px 24px ${color}10`
      }}>
        <CardContent sx={{ 
          p: 3, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <Avatar sx={{
              bgcolor: highlighted ? 'rgba(255,255,255,0.2)' : `${color}20`,
              color: highlighted ? '#fff' : color,
              width: 56,
              height: 56
            }}>
              {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, { sx: { fontSize: 28 } })}
            </Avatar>
          </Box>
          <Box sx={{ mt: 'auto', width: '100%' }}>
            <Typography variant="body2" sx={{
              color: highlighted ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 0.5
            }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{
              fontWeight: 850,
              color: '#FFFFFF',
              fontSize: '1.75rem',
              fontFamily: '"Manrope", sans-serif',
              letterSpacing: '-0.02em'
            }}>
              {formatCurrency(value)}
            </Typography>
            {statusText && (
              <Typography variant="caption" sx={{ 
                color: highlighted ? 'rgba(255,255,255,0.8)' : color, 
                fontWeight: 700, 
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                mt: 0.5,
                display: 'block'
              }}>
                {statusText}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DailyBudget = () => {
  const [stats, setStats] = React.useState<DailyBudgetStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [operatingLimit, setOperatingLimit] = React.useState('');
  const [discretionaryLimit, setDiscretionaryLimit] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDailyBudgetStats();
        setStats(data);
        setOperatingLimit(data.operatingLimit.toString());
        setDiscretionaryLimit(data.discretionaryLimit.toString());
      } catch (err) {
        console.error('Error fetching daily budget stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateUserSettings({
        daily_operating_limit: parseFloat(operatingLimit) || 0,
        daily_discretionary_limit: parseFloat(discretionaryLimit) || 0
      });
      setOpenDialog(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error updating user settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* HEADER */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: { xs: 4, md: 6 }
      }}>
        <Box>
          <Typography variant="h3" sx={{
            fontWeight: 900,
            color: '#FFFFFF',
            mb: 1,
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            letterSpacing: '-0.02em'
          }}>
            Presupuesto Diario
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
            Monitorea y ajusta tu límite operativo y tus gastos libres acumulativos
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: '12px',
            borderColor: 'rgba(255,255,255,0.12)',
            color: '#FFFFFF',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#316ee9',
              bgcolor: 'rgba(49, 110, 233, 0.05)'
            }
          }}
        >
          Ajustar Límites
        </Button>
      </Box>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Total Diario (Solo Mío)"
            value={stats?.operatingLimit || 0}
            icon={<AccountBalanceWallet />}
            color="#316ee9"
            highlighted={true}
            statusText="Tu capacidad diaria de gasto"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Gastos Diarios / Salidas (Míos)"
            value={stats?.discretionaryLimit || 0}
            icon={<ShoppingBag />}
            color="#00A3E0"
            statusText="Límite diario para gustos"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Sobrante de Salidas Acumulado"
            value={stats?.leftover || 0}
            icon={(stats?.leftover || 0) >= 0 ? <TrendingUp /> : <TrendingDown />}
            color={(stats?.leftover || 0) >= 0 ? "#039855" : "#D92D20"}
            highlighted={(stats?.leftover || 0) < 0}
            statusText={(stats?.leftover || 0) >= 0 ? "Fondo acumulado positivo" : "Excedido este mes"}
          />
        </Grid>
      </Grid>

      {/* INFORMATION PANEL */}
      <Card sx={{
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        p: 3
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar sx={{ bgcolor: 'rgba(49, 110, 233, 0.1)', color: '#316ee9' }}>
            <InfoOutlined />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1 }}>
              ¿Cómo funciona el cálculo del sobrante?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Tu presupuesto diario de gustos/salidas ({formatCurrency(stats?.discretionaryLimit || 0)}) se acumula día con día.
              Hoy (día {new Date().getDate()} del mes) has acumulado un presupuesto de{' '}
              <strong>{formatCurrency(new Date().getDate() * (stats?.discretionaryLimit || 0))}</strong> para gustos personales.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mt: 1.5 }}>
              Al acumulado se le restan únicamente los gastos del mes que pertenezcan a categorías como{' '}
              <strong>Restaurantes, Ropa, Entretenimiento, Ant y Delivery</strong>. Los gastos fijos del hogar, seguros y
              del supermercado (despensa) se ignoran para no afectar tu presupuesto libre diario.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* EDIT LIMITS DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#111927',
            backgroundImage: 'none',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 800 }}>Ajustar Presupuesto Diario</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Define los topes de presupuesto. Estos cambios se guardarán en la base de datos de Supabase y actualizarán el cálculo al instante.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Límite Operativo Diario (Servicios/Transporte/Super)"
              type="number"
              variant="outlined"
              value={operatingLimit}
              onChange={(e) => setOperatingLimit(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                },
                '& .MuiInputLabel-root': { color: 'text.secondary' }
              }}
            />
            <TextField
              label="Límite Diario Mío (Gustos/Salidas)"
              type="number"
              variant="outlined"
              value={discretionaryLimit}
              onChange={(e) => setDiscretionaryLimit(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                },
                '& .MuiInputLabel-root': { color: 'text.secondary' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveSettings}
            variant="contained"
            disabled={saving}
            sx={{
              bgcolor: '#316ee9',
              borderRadius: '10px',
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#1a56cc' }
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyBudget;
