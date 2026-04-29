import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type RecurringTransaction } from '../services/api';
import { Home, ShoppingCart, ShoppingBag, Favorite, Coffee, AttachMoney, MoreHoriz, Restaurant, DirectionsCar, VpnKey, ElectricBolt, WaterDrop, Wifi, Build, MedicalServices, SentimentSatisfiedAlt, PlayCircle, ConfirmationNumber, Checkroom, Redeem, TrendingUp, CreditCard, Shield, Percent, Work, Help } from '@mui/icons-material';

const IconMapper: Record<string, React.ReactNode> = {
  'home': <Home fontSize="small" />,
  'shopping-cart': <ShoppingCart fontSize="small" />,
  'shopping-bag': <ShoppingBag fontSize="small" />,
  'heart': <Favorite fontSize="small" />,
  'coffee': <Coffee fontSize="small" />,
  'dollar-sign': <AttachMoney fontSize="small" />,
  'more-horizontal': <MoreHoriz fontSize="small" />,
  'utensils': <Restaurant fontSize="small" />,
  'car': <DirectionsCar fontSize="small" />,
  'key': <VpnKey fontSize="small" />,
  'zap': <ElectricBolt fontSize="small" />,
  'droplet': <WaterDrop fontSize="small" />,
  'wifi': <Wifi fontSize="small" />,
  'tool': <Build fontSize="small" />,
  'stethoscope': <MedicalServices fontSize="small" />,
  'smile': <SentimentSatisfiedAlt fontSize="small" />,
  'play-circle': <PlayCircle fontSize="small" />,
  'ticket': <ConfirmationNumber fontSize="small" />,
  'shirt': <Checkroom fontSize="small" />,
  'gift': <Redeem fontSize="small" />,
  'trending-up': <TrendingUp fontSize="small" />,
  'credit-card': <CreditCard fontSize="small" />,
  'shield': <Shield fontSize="small" />,
  'percent': <Percent fontSize="small" />,
  'briefcase': <Work fontSize="small" />,
  'default': <Help fontSize="small" />
};

const frequencyLabels: Record<string, string> = {
  'weekly': 'Semanal',
  'monthly': 'Mensual',
  'yearly': 'Anual'
};

interface RecurringExpenseListProps {
  onEdit?: (item: RecurringTransaction) => void;
  onRefresh?: () => void;
}

const RecurringExpenseList: React.FC<RecurringExpenseListProps> = ({ onEdit, onRefresh }) => {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.getRecurringTransactions();
      // Filter active only by default
      setItems(data.filter(item => item.is_active !== false));
    } catch (err: any) {
      setError(err.message || 'Error al cargar gastos recurrentes');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desactivar este gasto recurrente?')) return;
    
    try {
      await api.deleteRecurringTransaction(id);
      await fetchItems();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    }
  };
  
  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await api.updateRecurringTransaction(item.id, { is_active: !item.is_active });
      await fetchItems();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (items.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        bgcolor: 'rgba(255,255,255,0.02)',
        borderRadius: 2,
        border: '1px dashed rgba(255,255,255,0.1)'
      }}>
        <ReplayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          No hay gastos recurrentes configurados
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.7, mt: 1 }}>
          Agrega uno arriba para comenzar
        </Typography>
      </Box>
    );
  }
  
  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0 }}>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ListItem
            key={item.id}
            component={motion.div}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '12px',
              p: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: item.is_active === false ? 0.5 : 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(217, 45, 32, 0.1)',
                color: '#F04438',
                width: 44,
                height: 44,
                borderRadius: '12px'
              }}>
                {IconMapper[item.categories?.icon || 'default']}
              </Avatar>
              <Box>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem' }}>
                  {item.description || item.categories?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  {item.categories?.name} • {frequencyLabels[item.frequency]}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 700, color: '#F04438', fontSize: '1rem' }}>
                  -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(item.amount))}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
                  Próxima: {new Date(item.next_execution_date + 'T00:00:00').toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {item.is_active === false ? (
                  <IconButton size="small" onClick={() => handleToggleActive(item)} sx={{ color: '#12B76A' }}>
                    <ReplayIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <>
                    <IconButton size="small" onClick={() => onEdit?.(item)} sx={{ color: '#00A3E0' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: '#F04438' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </ListItem>
        ))}
      </AnimatePresence>
    </List>
  );
};

export default RecurringExpenseList;