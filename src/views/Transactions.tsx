import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Help,
  Home,
  ShoppingCart,
  ShoppingBag,
  Favorite,
  Coffee,
  AttachMoney,
  MoreHoriz,
  Restaurant,
  DirectionsCar,
  VpnKey,
  ElectricBolt,
  WaterDrop,
  Wifi,
  Build,
  MedicalServices,
  SentimentSatisfiedAlt,
  PlayCircle,
  ConfirmationNumber,
  Checkroom,
  Redeem,
  TrendingUp,
  CreditCard,
  Shield,
  Percent,
  Work,
  Description as DescriptionIcon,
  LocalOffer,
  AddCircle,
  LocalShipping,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CompareArrows as TransferIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { api, type Category, type Account, type Transaction, type RecurringTransaction } from '../services/api';
import RecurringExpenseForm from '../components/RecurringExpenseForm';
import RecurringExpenseList from '../components/RecurringExpenseList';
import { formatLocalDate } from '../utils/date';

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
  'file-text': <DescriptionIcon fontSize="small" />,
  'tag': <LocalOffer fontSize="small" />,
  'plus-circle': <AddCircle fontSize="small" />,
  'truck': <LocalShipping fontSize="small" />,
  'help-circle': <Help fontSize="small" />,
  'transfer': <TransferIcon fontSize="small" />,
  'default': <Help fontSize="small" />
};

const Transactions = () => {
  const { user } = useAuthStore();

  // Colores de Plataforma (Brand Identity)
  const AZURE_BLUE = '#002D72';
  const SKY_BLUE = '#00A3E0';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const handleTypeChange = (newType: 'expense' | 'income' | 'transfer') => {
    setType(newType);
    setPage(0); // Reset page on type change
  };
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(formatLocalDate(new Date()));
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [recurringRefreshKey, setRecurringRefreshKey] = useState(0);
  const [recurringExpanded, setRecurringExpanded] = useState(false);

  
  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterAccountId, setFilterAccountId] = useState('all');


  const fetchData = async () => {
    try {
      setLoading(true);

      const [accs, cats, { data: trans, count }] = await Promise.all([
        api.getAccounts(),
        api.getCategories(type === 'transfer' ? 'expense' : type),
        api.getTransactions(page, rowsPerPage, filterAccountId)
      ]);



      setAccounts(accs);
      setCategories(cats);
      setTransactions(trans);
      setTotalCount(count);

      // Lógica de auto-selección de categoría
      if (type === 'transfer') {
        const transferCat = cats.find(c => c.name.toLowerCase() === 'transferencia');
        if (transferCat) {
          setCategoryId(transferCat.id);
        } else if (cats.length > 0) {
          // Si no existe, al menos ponemos la primera para que no sea null, 
          // aunque el backend creará la correcta por su cuenta.
          setCategoryId(cats[0].id);
        }
      } else if (cats.length > 0) {
        setCategoryId(cats[0].id);
      } else {
        setCategoryId('');
      }

      if (accs.length > 0 && !accountId) {
        setAccountId(accs[0].id);
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error al obtener datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, page, rowsPerPage, filterAccountId]);


  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId) return;

    setSubmitting(true);
    setError(null);

    try {
      if (!accountId) throw new Error('Selecciona una cuenta para registrar el movimiento');

      if (type === 'transfer') {
        if (!toAccountId) throw new Error('Selecciona la cuenta destino para la transferencia');
        if (accountId === toAccountId) throw new Error('La cuenta origen y destino no pueden ser la misma');
        
        await api.createTransfer({
          user_id: user.id,
          from_account_id: accountId,
          to_account_id: toAccountId,
          amount: parseFloat(amount),
          date,
          description
        });
      } else {
        const transactionData = {
          user_id: user.id,
          account_id: accountId,
          category_id: categoryId,
          amount: parseFloat(amount),
          type,
          date,
          description
        };

        if (editingId) {
          await api.updateTransaction(editingId, transactionData);
          setEditingId(null);
        } else {
          await api.createTransaction(transactionData as any);
        }
      }

      setAmount('');
      setDescription('');
      setToAccountId('');
      setDate(formatLocalDate(new Date()));
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar registro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (t: Transaction) => {
    setEditingId(t.id!);
    handleTypeChange(t.type);
    setAmount(t.amount.toString());
    setCategoryId(t.category_id);
    setAccountId(t.account_id);
    setDate(t.date);
    setDescription(t.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAmount('');
    setDescription('');
    setDate(formatLocalDate(new Date()));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) return;
    try {
      setLoading(true);
      await api.deleteTransaction(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      maxWidth: 1200, // Expandimos para escritorio
      mx: 'auto',
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* TÍTULO DE VISTA */}
      <Typography variant="h4" sx={{
        color: '#FFFFFF',
        fontWeight: 800,
        mb: 4,
        fontFamily: '"Manrope", sans-serif',
        textAlign: { xs: 'center', md: 'left' }
      }}>
        {editingId ? 'Editar Transacción' : 'Transacciones'}
      </Typography>

      <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
        {/* FILA SUPERIOR: FORMULARIO Y RECURRENTES */}
        <Grid size={{ xs: 12, md: 6 }}>

          <Card sx={{
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box component="form" onSubmit={handleSubmit}>
                {/* SELECTOR DE TIPO: GASTO / INGRESO */}
                <Box sx={{
                  display: 'flex',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  p: 0.5,
                  mb: 3
                }}>
                  <Button
                    onClick={() => handleTypeChange('expense')}
                    fullWidth
                    sx={{
                      borderRadius: '10px',
                      py: 1,
                      fontSize: '0.75rem',
                      bgcolor: type === 'expense' ? AZURE_BLUE : 'transparent',
                      color: type === 'expense' ? '#FFFFFF' : 'text.secondary',
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: type === 'expense' ? AZURE_BLUE : 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    GASTO
                  </Button>
                  <Button
                    onClick={() => handleTypeChange('income')}
                    fullWidth
                    sx={{
                      borderRadius: '10px',
                      py: 1,
                      fontSize: '0.75rem',
                      bgcolor: type === 'income' ? SKY_BLUE : 'transparent',
                      color: type === 'income' ? '#FFFFFF' : 'text.secondary',
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: type === 'income' ? SKY_BLUE : 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    INGRESO
                  </Button>
                  <Button
                    onClick={() => handleTypeChange('transfer')}
                    fullWidth
                    sx={{
                      borderRadius: '10px',
                      py: 1,
                      fontSize: '0.75rem',
                      bgcolor: type === 'transfer' ? '#6366F1' : 'transparent', // Indigo for transfer
                      color: type === 'transfer' ? '#FFFFFF' : 'text.secondary',
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: type === 'transfer' ? '#6366F1' : 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    TRF
                  </Button>
                </Box>

                {/* BLOQUE SUPERIOR: MONTO */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', mb: 1 }}>
                    MONTO
                  </Typography>
                  <Box sx={{
                    bgcolor: type === 'expense' ? AZURE_BLUE : (type === 'income' ? SKY_BLUE : '#6366F1'),
                    borderRadius: '12px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 100,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <TextField
                      variant="standard"
                      placeholder="$0.00"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      fullWidth
                      sx={{
                        '& .MuiInput-root': {
                          fontSize: '36px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          '&:before, &:after': { display: 'none' },
                          '& input': {
                            textAlign: 'center',
                            padding: 0,
                            '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* FORM FIELDS */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', mb: 1 }}>
                        {type === 'transfer' ? 'DESDE CUENTA' : 'CUENTA / ORIGEN'}
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          }
                        }}
                        slotProps={{ select: { IconComponent: KeyboardArrowDown } }}
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    {type === 'transfer' && (
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', mb: 1 }}>A CUENTA</Typography>
                        <TextField
                          select
                          fullWidth
                          value={toAccountId}
                          onChange={(e) => setToAccountId(e.target.value)}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.03)',
                              borderRadius: '10px',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            }
                          }}
                          slotProps={{ select: { IconComponent: KeyboardArrowDown } }}
                        >
                          {accounts.filter(a => a.id !== accountId).map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', mb: 1 }}>CATEGORÍA</Typography>
                      <TextField
                        select
                        fullWidth
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        disabled={type === 'transfer'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            opacity: type === 'transfer' ? 0.7 : 1
                          }
                        }}
                        slotProps={{ select: { IconComponent: KeyboardArrowDown } }}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id} sx={{ pl: cat.parent_id ? 4 : 2 }}>{cat.name}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', mb: 1 }}>FECHA</Typography>
                      <TextField
                        type="date"
                        fullWidth
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          },
                          '& input': { color: '#FFF' }
                        }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', mb: 1 }}>DESCRIPCIÓN</Typography>
                    <TextField
                      multiline
                      rows={2}
                      fullWidth
                      placeholder="Ej. Almuerzo con clientes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.03)',
                          borderRadius: '10px',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          color: '#FFFFFF'
                        }
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || loading}
                    fullWidth
                    sx={{
                      bgcolor: type === 'expense' ? AZURE_BLUE : (type === 'income' ? SKY_BLUE : '#6366F1'),
                      py: 1.5,
                      borderRadius: '10px',
                      fontWeight: 700,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        bgcolor: type === 'expense' ? '#001F4F' : (type === 'income' ? '#0081B3' : '#4F46E5'),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : (editingId ? 'Actualizar Cambios' : (type === 'transfer' ? 'Confirmar Transferencia' : 'Registrar Transacción'))}
                  </Button>
                  {editingId && (
                    <Button onClick={handleCancelEdit} fullWidth sx={{ color: 'text.secondary', textTransform: 'none' }}>
                      Cancelar Edición
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* COLUMNA DERECHA: GASTOS RECURRENTES */}
        <Grid size={{ xs: 12, md: 6 }}>
          {isMobile ? (
            <Accordion 
              expanded={recurringExpanded}
              onChange={() => setRecurringExpanded(!recurringExpanded)}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '16px !important',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                '&:before': { display: 'none' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <AccordionSummary
                expandIcon={recurringExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  '& .MuiAccordionSummary-content': { my: 2 }
                }}
              >
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  Gastos Recurrentes
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <RecurringExpenseForm 
                    editData={editingRecurring || undefined}
                    onCancelEdit={() => setEditingRecurring(null)}
                    onSuccess={() => {
                      setEditingRecurring(null);
                      setRecurringRefreshKey(k => k + 1);
                    }}
                  />
                  
                  <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', pt: 3 }}>
                    <RecurringExpenseList 
                      key={recurringRefreshKey}
                      onEdit={(item) => setEditingRecurring(item)}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Card sx={{
              bgcolor: 'background.paper',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%'
            }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 3 }}>
                  Gastos Recurrentes
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <RecurringExpenseForm 
                    editData={editingRecurring || undefined}
                    onCancelEdit={() => setEditingRecurring(null)}
                    onSuccess={() => {
                      setEditingRecurring(null);
                      setRecurringRefreshKey(k => k + 1);
                    }}
                  />
                  
                  <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', pt: 3 }}>
                    <RecurringExpenseList 
                      key={recurringRefreshKey}
                      onEdit={(item) => setEditingRecurring(item)}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>


        {/* FILA INFERIOR: LISTADO DE MOVIMIENTOS (FULL WIDTH) */}
        <Grid size={{ xs: 12 }}>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: 2,
            mb: 3 
          }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
              Movimientos Recientes
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                select
                size="small"
                value={filterAccountId}
                onChange={(e) => {
                  setFilterAccountId(e.target.value);
                  setPage(0);
                }}
                sx={{
                  minWidth: 150,
                  flex: { xs: 1, sm: 'none' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  }
                }}
                slotProps={{ select: { IconComponent: KeyboardArrowDown } }}
              >
                <MenuItem value="all">Todas las cuentas</MenuItem>
                {accounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {totalCount} registros
              </Typography>
            </Box>
          </Box>


          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0 }}>
            <AnimatePresence mode="popLayout">
              {transactions.map((t) => (
                <ListItem
                  key={t.id}
                  component={motion.div}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '16px',
                    p: 2,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.1)'
                    },
                    '&:hover .action-btns': { opacity: 1 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: t.categories?.name.toLowerCase() === 'transferencia' 
                        ? 'rgba(99, 102, 241, 0.1)' 
                        : (t.type === 'expense' ? 'rgba(217, 45, 32, 0.1)' : 'rgba(3, 152, 85, 0.1)'),
                      color: t.categories?.name.toLowerCase() === 'transferencia' 
                        ? '#6366F1' 
                        : (t.type === 'expense' ? '#F04438' : '#12B76A'),
                      width: 44,
                      height: 44,
                      borderRadius: '12px'
                    }}>
                      {t.categories?.name.toLowerCase() === 'transferencia' 
                        ? <TransferIcon fontSize="small" /> 
                        : IconMapper[t.categories?.icon || 'default']}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem' }}>
                        {t.description || t.categories?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        {t.categories?.name} • {new Date(t.date + 'T00:00:00').toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: t.categories?.name.toLowerCase() === 'transferencia' 
                          ? '#6366F1' 
                          : (t.type === 'expense' ? '#F04438' : '#12B76A'),
                        fontSize: '1rem'
                      }}>
                        {t.categories?.name.toLowerCase() === 'transferencia' ? '⇄ ' : (t.type === 'expense' ? '-' : '+')}
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(t.amount))}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
                        {accounts.find(a => a.id === t.account_id)?.name || 'Cuenta'}
                      </Typography>
                    </Box>

                    <Box className="action-btns" sx={{ 
                      display: 'flex', 
                      gap: 0.5, 
                      opacity: { xs: 1, md: 0 }, 
                      transition: 'opacity 0.2s' 
                    }}>
                      <IconButton size="small" onClick={() => handleEditClick(t)} sx={{ color: SKY_BLUE }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(t.id!)} sx={{ color: '#F04438' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </AnimatePresence>
          </List>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página"
            sx={{
              color: 'text.secondary',
              '.MuiTablePagination-selectIcon': { color: 'text.secondary' },
              '.MuiTablePagination-actions': { color: 'text.secondary' }
            }}
          />
        </Grid>

      </Grid>
    </Box>
  );
};

export default Transactions;
