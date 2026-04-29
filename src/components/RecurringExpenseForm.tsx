import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';
import { api, type Category, type Account, type RecurringTransaction } from '../services/api';
import { formatLocalDate } from '../utils/date';

interface RecurringExpenseFormProps {
  onSuccess?: () => void;
  editData?: RecurringTransaction;
  onCancelEdit?: () => void;
}

const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({ onSuccess, editData, onCancelEdit }) => {
  const { user } = useAuthStore();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [description, setDescription] = useState('');
  const [nextExecutionDate, setNextExecutionDate] = useState(formatLocalDate(new Date()));
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accs, cats] = await Promise.all([
          api.getAccounts(),
          api.getCategories('expense')
        ]);
        setAccounts(accs);
        setCategories(cats);
        
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
        if (accs.length > 0 && !accountId) {
          setAccountId(accs[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle edit mode
  useEffect(() => {
    if (editData) {
      setAccountId(editData.account_id);
      setCategoryId(editData.category_id);
      setAmount(editData.amount.toString());
      setFrequency(editData.frequency);
      setDescription(editData.description || '');
      setNextExecutionDate(editData.next_execution_date);
    }
  }, [editData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId || !accountId) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const data = {
        user_id: user.id,
        account_id: accountId,
        category_id: categoryId,
        amount: parseFloat(amount),
        type: 'expense' as const,
        frequency,
        next_execution_date: nextExecutionDate,
        description: description || undefined,
        is_active: true
      };
      
      if (editData) {
        await api.updateRecurringTransaction(editData.id, data);
      } else {
        await api.createRecurringTransaction(data);
      }
      
      // Reset form
      setAmount('');
      setDescription('');
      setNextExecutionDate(formatLocalDate(new Date()));
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Cuenta"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Categoría"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            slotProps={{
              input: {
                startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
              }
            }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Frecuencia"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            required
          >
            <MenuItem value="weekly">Semanal</MenuItem>
            <MenuItem value="monthly">Mensual</MenuItem>
            <MenuItem value="yearly">Anual</MenuItem>
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Próxima ejecución"
            type="date"
            value={nextExecutionDate}
            onChange={(e) => setNextExecutionDate(e.target.value)}
            required
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Netflix, Netflix..."
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{
                bgcolor: '#002D72',
                '&:hover': { bgcolor: '#001F4F' }
              }}
            >
              {editData ? 'Actualizar' : 'Agregar Recurrente'}
            </Button>
            {editData && onCancelEdit && (
              <Button
                onClick={onCancelEdit}
                sx={{ color: 'text.secondary' }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecurringExpenseForm;