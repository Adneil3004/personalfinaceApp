import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Tooltip,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  CreditCard, 
  InfoOutlined, 
  ChevronRight,
  ShoppingBag 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const MSITracker = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getMSIPlans();
      setPlans(data);
    } catch (err) {
      console.error('Error loading MSI plans:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (plans.length === 0) return null;

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard sx={{ color: '#316ee9' }} />
          Mensualidades MSI
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: '#fff' }, display: 'flex', alignItems: 'center' }}>
          Ver todo <ChevronRight sx={{ fontSize: 16 }} />
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {plans.map((plan) => {
          const current = plan.msi_current_installment || 1;
          const total = plan.msi_total_installments || 1;
          const progress = (current / total) * 100;
          const remainingAmount = plan.amount * (total - current + 1);
          
          return (
            <Grid item xs={12} md={6} key={plan.id}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: plan.categories?.color ? `${plan.categories.color}20` : 'rgba(49,110,233,0.1)', 
                        color: plan.categories?.color || '#316ee9',
                        width: 40, 
                        height: 40 
                      }}>
                         <ShoppingBag />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                          {plan.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {plan.accounts?.name} • {formatCurrency(plan.amount)} / mes
                        </Typography>
                      </Box>
                      <Tooltip title={`Monto restante por pagar: ${formatCurrency(remainingAmount)}`}>
                        <IconButton size="small">
                          <InfoOutlined sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Box sx={{ mb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                          Mensualidad {current} de {total}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#316ee9' }}>
                          {Math.round(progress)}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #316ee9 0%, #75a2ff 100%)',
                            borderRadius: 3
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MSITracker;
