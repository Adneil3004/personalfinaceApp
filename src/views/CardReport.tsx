import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  TablePagination
} from '@mui/material';
import {
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
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
  TrendingDown,
  CreditCard,
  Shield,
  Percent,
  Work,
  Description as DescriptionIcon,
  LocalOffer,
  AddCircle,
  LocalShipping,
  CompareArrows as TransferIcon,
  AccountBalance,
  AccountBalanceWallet,
  ReceiptLong,
  Savings
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { api, type Account, type Transaction } from '../services/api';
import { formatLocalDate } from '../utils/date';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);

const chartColors = ['#00A3E0', '#316ee9', '#002D72', '#81cfff', '#039855', '#D92D20', '#FDB022', '#6366F1', '#A855F7'];

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Débito',
  cash: 'Efectivo',
  credit: 'Crédito',
};

const ACCOUNT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  checking: { bg: 'rgba(49,110,233,0.15)', text: '#316ee9' },
  cash:     { bg: 'rgba(253,176,34,0.15)', text: '#FDB022' },
  credit:   { bg: 'rgba(217,45,32,0.15)',  text: '#D92D20' },
};

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  checking: <AccountBalance fontSize="small" />,
  cash:     <AccountBalanceWallet fontSize="small" />,
  credit:   <CreditCard fontSize="small" />,
};

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

const cardSx = {
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  height: '100%'
};

const DEFAULT_ROWS_PER_PAGE = 10;

type PeriodMode = 'month' | 'all' | 'custom';

// ─── view ─────────────────────────────────────────────────────────────────────

const CardReport = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listPage, setListPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await api.getAccounts();
        const active = accs.filter(a => a.is_active !== false);
        setAccounts(active);
        if (active.length > 0) {
          setSelectedAccountId(active[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cuentas');
        setLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const invalidRange = periodMode === 'custom' && !!customFrom && !!customTo && customFrom > customTo;

  const { startDate, endDate } = useMemo(() => {
    if (periodMode === 'month') {
      const y = monthDate.getFullYear();
      const m = monthDate.getMonth();
      return {
        startDate: formatLocalDate(new Date(y, m, 1)),
        endDate: formatLocalDate(new Date(y, m + 1, 0))
      };
    }
    if (periodMode === 'custom') {
      return { startDate: customFrom || undefined, endDate: customTo || undefined };
    }
    return { startDate: undefined, endDate: undefined };
  }, [periodMode, monthDate, customFrom, customTo]);

  useEffect(() => {
    if (!selectedAccountId || invalidRange) return;
    setListPage(0);
    const loadExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAccountExpenses(selectedAccountId, startDate, endDate);
        setExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar gastos');
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, [selectedAccountId, startDate, endDate, invalidRange]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const totalExpenses = useMemo(
    () => expenses.reduce((s, t) => s + Number(t.amount), 0),
    [expenses]
  );

  const byCategory = useMemo(() => {
    const map: Record<string, { value: number; color?: string }> = {};
    expenses.forEach(t => {
      const name = t.categories?.name || 'Sin categoría';
      if (!map[name]) map[name] = { value: 0, color: t.categories?.color };
      map[name].value += Number(t.amount);
    });
    return Object.keys(map)
      .map((name, i) => ({
        name,
        value: map[name].value,
        color: map[name].color || chartColors[i % chartColors.length],
        pct: totalExpenses > 0 ? (map[name].value / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, totalExpenses]);

  const isCurrentMonth =
    monthDate.getFullYear() === new Date().getFullYear() &&
    monthDate.getMonth() === new Date().getMonth();

  const navigateMonth = (delta: number) => {
    setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const monthLabel = monthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const balance = Number(selectedAccount?.current_balance ?? 0);
  const isCredit = selectedAccount?.type === 'credit';

  if (accounts.length === 0 && !loading && !error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          No tienes cuentas activas
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: 'background.default' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* HEADER */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Typography variant="h4" sx={{
          color: '#FFFFFF',
          fontWeight: 800,
          fontFamily: '"Manrope", sans-serif'
        }}>
          Gastos por Tarjeta
        </Typography>

        <TextField
          select
          size="small"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          sx={{
            minWidth: 220,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              color: '#FFFFFF',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            }
          }}
          slotProps={{ select: { IconComponent: KeyboardArrowDown } }}
        >
          {accounts.map((acc) => (
            <MenuItem key={acc.id} value={acc.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: ACCOUNT_TYPE_COLORS[acc.type]?.text, display: 'flex' }}>
                  {ACCOUNT_ICONS[acc.type]}
                </Box>
                {acc.name}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* BARRA DE PERÍODO */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 4
      }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={periodMode}
          onChange={(_e, val) => { if (val) setPeriodMode(val); }}
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            '& .MuiToggleButton-root': {
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 600,
              border: 'none',
              px: 2,
              '&.Mui-selected': {
                bgcolor: '#002D72',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#001F4F' }
              }
            }
          }}
        >
          <ToggleButton value="month">Mes</ToggleButton>
          <ToggleButton value="all">Todos</ToggleButton>
          <ToggleButton value="custom">Personalizado</ToggleButton>
        </ToggleButtonGroup>

        {periodMode === 'month' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => navigateMonth(-1)} sx={{ color: '#FFFFFF' }}>
              <ChevronLeft />
            </IconButton>
            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>
              {monthLabel}
            </Typography>
            <IconButton size="small" onClick={() => navigateMonth(1)} disabled={isCurrentMonth} sx={{ color: '#FFFFFF' }}>
              <ChevronRight />
            </IconButton>
          </Box>
        )}

        {periodMode === 'custom' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              size="small"
              label="Desde"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              error={invalidRange}
              helperText={invalidRange ? 'Rango inválido' : undefined}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                },
                '& input': { color: '#FFF' }
              }}
            />
            <TextField
              type="date"
              size="small"
              label="Hasta"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              error={invalidRange}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                },
                '& input': { color: '#FFF' }
              }}
            />
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* SALDO TOTAL */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
              <Card sx={{
                ...cardSx,
                background: 'linear-gradient(135deg, #0F1B4C 0%, #1a2f7a 100%)',
                boxShadow: '0 8px 32px rgba(49,110,233,0.25)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 48, height: 48, mb: 2 }}>
                    <Savings sx={{ color: '#FDB022' }} />
                  </Avatar>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    {isCredit ? 'DEUDA ACTUAL' : 'SALDO TOTAL'}
                  </Typography>
                  <Typography variant="h4" sx={{
                    color: isCredit || balance < 0 ? '#FF8A80' : '#FFFFFF',
                    fontWeight: 800,
                    fontFamily: '"Manrope", sans-serif',
                    mt: 0.5
                  }}>
                    {fmt(isCredit ? Math.abs(balance) : balance)}
                  </Typography>
                  {isCredit && Number(selectedAccount?.credit_limit) > 0 && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      de {fmt(Number(selectedAccount?.credit_limit))} de límite
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* BANCO / CUENTA */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{
                    bgcolor: ACCOUNT_TYPE_COLORS[selectedAccount?.type || 'checking'].bg,
                    color: ACCOUNT_TYPE_COLORS[selectedAccount?.type || 'checking'].text,
                    width: 48,
                    height: 48,
                    mb: 2
                  }}>
                    {ACCOUNT_ICONS[selectedAccount?.type || 'checking']}
                  </Avatar>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    CUENTA
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 800, fontFamily: '"Manrope", sans-serif', mt: 0.5 }}>
                    {selectedAccount?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip
                      label={ACCOUNT_TYPE_LABELS[selectedAccount?.type || 'checking']}
                      size="small"
                      sx={{
                        bgcolor: ACCOUNT_TYPE_COLORS[selectedAccount?.type || 'checking'].bg,
                        color: ACCOUNT_TYPE_COLORS[selectedAccount?.type || 'checking'].text,
                        fontWeight: 700
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      •••• {selectedAccount?.id.slice(-4)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* GASTOS DEL PERÍODO */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ bgcolor: 'rgba(217,45,32,0.15)', color: '#F04438', width: 48, height: 48, mb: 2 }}>
                    <TrendingDown fontSize="small" />
                  </Avatar>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    {periodMode === 'month' ? 'GASTOS DEL MES' : 'GASTOS DEL PERIODO'}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#F04438', fontWeight: 800, fontFamily: '"Manrope", sans-serif', mt: 0.5 }}>
                    -{fmt(totalExpenses)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {expenses.length} {expenses.length === 1 ? 'cargo' : 'cargos'}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* CARGOS RECIENTES */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                  Cargos recientes
                </Typography>

                {expenses.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ReceiptLong sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography sx={{ color: 'text.secondary' }}>
                      Sin gastos en este periodo
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <List sx={{ p: 0 }}>
                      {expenses.slice(listPage * rowsPerPage, listPage * rowsPerPage + rowsPerPage).map((t) => {
                        const catColor = t.categories?.color || '#94A3B8';
                        return (
                          <ListItem
                            key={t.id}
                            sx={{
                              px: 0,
                              py: 1.5,
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                              <Avatar sx={{
                                bgcolor: `${catColor}20`,
                                color: catColor,
                                width: 40,
                                height: 40,
                                borderRadius: '12px'
                              }}>
                                {IconMapper[t.categories?.icon || 'default']}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography noWrap sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {t.description || t.categories?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                                  {t.categories?.name} · {new Date(t.date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography sx={{ color: '#F04438', fontWeight: 700, whiteSpace: 'nowrap', ml: 2 }}>
                              -{fmt(Number(t.amount))}
                            </Typography>
                          </ListItem>
                        );
                      })}
                    </List>
                    <TablePagination
                      component="div"
                      count={expenses.length}
                      page={listPage}
                      onPageChange={(_e, newPage) => setListPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setListPage(0);
                      }}
                      rowsPerPageOptions={[5, 10, 25]}
                      labelRowsPerPage="Por página"
                      labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                      sx={{
                        color: 'text.secondary',
                        '.MuiTablePagination-selectIcon': { color: 'text.secondary' },
                        '.MuiTablePagination-actions': { color: 'text.secondary' }
                      }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* DISTRIBUCIÓN DE GASTOS */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                  Distribución de gastos
                </Typography>

                {byCategory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Sin datos para graficar
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byCategory}
                            dataKey="value"
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={2}
                            stroke="none"
                          >
                            {byCategory.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => fmt(Number(value))}
                            contentStyle={{
                              backgroundColor: '#111927',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 8,
                              color: '#FFFFFF'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {byCategory.map((entry) => (
                        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
                            <Typography noWrap variant="body2" sx={{ color: '#FFFFFF' }}>
                              {entry.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, ml: 2 }}>
                            {entry.pct.toFixed(1)}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CardReport;
