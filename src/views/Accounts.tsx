import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  Avatar,
  Tooltip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance,
  CreditCard,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { api, type Account } from '../services/api';
import { motion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'CHECKING',
  cash:     'CASH',
  credit:   'CREDIT CARD',
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

const emptyForm = {
  name: '',
  type: 'checking' as Account['type'],
  currency: 'MXN',
  initial_balance: 0,
  credit_limit: 0,
  is_active: true,
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = ({
  title,
  value,
  icon,
  color,
  highlighted = false,
  sub,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlighted?: boolean;
  sub?: string;
}) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }} style={{ height: '100%' }}>
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        border: highlighted ? 'none' : '1px solid rgba(255,255,255,0.07)',
        background: highlighted
          ? 'linear-gradient(135deg, #0F1B4C 0%, #1a2f7a 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: highlighted ? 'rgba(255,255,255,0.65)' : 'text.secondary',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
            }}
          >
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}20`, color, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: highlighted ? '#fff' : color,
            fontFamily: '"Manrope", sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {fmt(value)}
        </Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: highlighted ? 'rgba(255,255,255,0.5)' : 'text.secondary', mt: 0.5 }}>
            {sub}
          </Typography>
        )}
        {highlighted && (
          <Box sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)' }}>
            <Box sx={{ height: '100%', width: '60%', borderRadius: 2, bgcolor: '#316ee9' }} />
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Main View ────────────────────────────────────────────────────────────────

const Accounts = () => {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Responsive
  const isMobile = useMediaQuery('(max-width:599px)');

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ ...emptyForm });
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = React.useState<Account | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = async () => {
    try {
      const [accs, st] = await Promise.all([
        api.getAccounts(),
        api.getAccountsStats(),
      ]);
      setAccounts(accs);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (acc: Account) => {
    setEditingId(acc.id);
    setForm({
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      initial_balance: acc.initial_balance,
      credit_limit: acc.credit_limit ?? 0,
      is_active: acc.is_active ?? true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('El nombre es requerido.'); return; }
    setSaving(true);
    setFormError('');
    try {
      let initial_balance = Number(form.initial_balance);
      // Si es tarjeta de crédito y el usuario puso un número positivo, lo pasamos a negativo (deuda)
      if (form.type === 'credit' && initial_balance > 0) {
        initial_balance = -initial_balance;
      }

      const payload = {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
        initial_balance,
        credit_limit: form.type === 'credit' ? Number(form.credit_limit) : undefined,
        is_active: form.is_active,
      };
      if (editingId) {
        await api.updateAccount(editingId, payload);
      } else {
        await api.createAccount(payload as any);
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setFormError(e?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteAccount(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: { xs: 3, sm: 0 }, mb: { xs: 3, sm: 5 } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', mb: 0.5 }}>
            Gestión de Cuentas
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Administra tus fuentes de capital, tarjetas y efectivo desde un solo lugar.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            borderRadius: '12px',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.2, sm: 1.5 },
            fontWeight: 700,
            textTransform: 'none',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg, #316ee9 0%, #0F1B4C 100%)',
            boxShadow: '0 4px 16px rgba(49,110,233,0.35)',
            '&:hover': { boxShadow: '0 6px 20px rgba(49,110,233,0.5)' },
          }}
        >
          {typeof window !== 'undefined' && window.innerWidth >= 600 ? 'Dar de Alta Nueva Cuenta' : 'Agregar'}
        </Button>
      </Box>

      {/* ── KPI Cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
        <Box sx={{ minHeight: 140 }}>
          <KpiCard 
            title="Patrimonio Neto" 
            value={stats?.netWorth ?? 0} 
            icon={<AccountBalanceWallet />} 
            color="#316ee9" 
            highlighted 
            sub="Capital + Deuda" 
          />
        </Box>
        <Box sx={{ minHeight: 140 }}>
          <KpiCard 
            title="Límite Crédito" 
            value={stats?.creditLimit ?? 0} 
            icon={<CreditCard />} 
            color="#81cfff" 
            sub="Cupo total disponible" 
          />
        </Box>
        <Box sx={{ minHeight: 140 }}>
          <KpiCard 
            title="Deuda (Crédito)" 
            value={Math.abs(stats?.totalDebt ?? 0)} 
            icon={<TrendingDown />} 
            color="#D92D20" 
            sub="Total a pagar" 
          />
        </Box>
        <Box sx={{ minHeight: 140 }}>
          <KpiCard 
            title="Capital (Débito)" 
            value={stats?.totalAssets ?? 0} 
            icon={<AccountBalance />} 
            color="#039855" 
            sub="Efectivo + Bancos" 
          />
        </Box>
        <Box sx={{ minHeight: 140 }}>
          <KpiCard 
            title="Ahorro Mensual" 
            value={stats?.monthlySavings ?? 0} 
            icon={<TrendingUp />} 
            color="#00A3E0" 
            sub="Ingreso − Gasto" 
          />
        </Box>
      </Box>

      {/* ── Accounts List ── */}
      <Card sx={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Cuentas Existentes
            </Typography>
          </Box>
          <Divider sx={{ opacity: 0.08 }} />

          {/* Mobile: Cards View */}
          {isMobile ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {accounts.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  No hay cuentas registradas. ¡Creá la primera!
                </Box>
              )}
              {accounts.map((acc) => {
                const typeColor = ACCOUNT_TYPE_COLORS[acc.type] ?? { bg: 'rgba(255,255,255,0.1)', text: '#fff' };
                const balance = acc.current_balance ?? acc.initial_balance;
                const isActive = acc.is_active !== false;
                return (
                  <Box
                    key={acc.id}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: `${typeColor.bg}`, color: typeColor.text, width: 36, height: 36 }}>
                          {ACCOUNT_ICONS[acc.type]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                            {acc.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {acc.currency} · {ACCOUNT_TYPE_LABELS[acc.type]}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openEdit(acc)} sx={{ color: '#316ee9' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteTarget(acc)} sx={{ color: '#D92D20' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: balance >= 0 ? '#039855' : '#D92D20' }}>
                        {fmt(balance)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#039855' : '#64748b' }} />
                        <Typography variant="caption" sx={{ color: isActive ? '#039855' : 'text.secondary', fontWeight: 600 }}>
                          {isActive ? 'Activa' : 'Inactiva'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
          /* Desktop: Table View */
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Nombre de la Cuenta', 'Tipo', 'Saldo Actual', 'Estado', 'Acciones'].map(h => (
                      <TableCell
                        key={h}
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          bgcolor: 'rgba(255,255,255,0.02)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', borderBottom: 'none' }}>
                        No hay cuentas registradas. ¡Creá la primera!
                      </TableCell>
                    </TableRow>
                  )}
                  {accounts.map((acc) => {
                    const typeColor = ACCOUNT_TYPE_COLORS[acc.type] ?? { bg: 'rgba(255,255,255,0.1)', text: '#fff' };
                    const balance = acc.current_balance ?? acc.initial_balance;
                    const isActive = acc.is_active !== false;
                    return (
                      <TableRow
                        key={acc.id}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.025)' },
                          '&:last-child td': { borderBottom: 'none' },
                          transition: 'background 0.15s',
                        }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: `${typeColor.bg}`, color: typeColor.text, width: 40, height: 40 }}>
                              {ACCOUNT_ICONS[acc.type]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                                {acc.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {acc.currency}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip
                            label={ACCOUNT_TYPE_LABELS[acc.type]}
                            size="small"
                            sx={{
                              bgcolor: typeColor.bg,
                              color: typeColor.text,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              letterSpacing: '0.04em',
                              borderRadius: '6px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: balance >= 0 ? '#039855' : '#D92D20' }}>
                            {fmt(balance)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#039855' : '#64748b', boxShadow: isActive ? '0 0 6px rgba(3,152,85,0.6)' : 'none' }} />
                            <Typography variant="caption" sx={{ color: isActive ? '#039855' : 'text.secondary', fontWeight: 600 }}>
                              {isActive ? 'Activa' : 'Inactiva'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEdit(acc)} sx={{ color: '#316ee9', '&:hover': { bgcolor: 'rgba(49,110,233,0.12)' } }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" onClick={() => setDeleteTarget(acc)} sx={{ color: '#D92D20', '&:hover': { bgcolor: 'rgba(217,45,32,0.12)' } }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Footer */}
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Mostrando {accounts.length} cuentas
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ── Modal Alta / Edición ── */}
      <Dialog
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        slotProps={{
          paper: { sx: { borderRadius: '20px', minWidth: { xs: '90dvw', sm: 480 }, bgcolor: 'background.paper' } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', pb: 1 }}>
          {editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </DialogTitle>
        <Divider sx={{ opacity: 0.08 }} />
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {formError && <Alert severity="error" sx={{ borderRadius: '10px' }}>{formError}</Alert>}

          <TextField
            label="Nombre de la cuenta"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            fullWidth
            size="small"
            autoFocus
          />

          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={form.type}
              label="Tipo"
              onChange={e => setForm(f => ({ ...f, type: e.target.value as Account['type'] }))}
            >
              <MenuItem value="checking">Cuenta Corriente</MenuItem>
              <MenuItem value="cash">Efectivo</MenuItem>
              <MenuItem value="credit">Tarjeta de Crédito</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Saldo Inicial"
            type="number"
            value={form.initial_balance}
            onChange={e => setForm(f => ({ ...f, initial_balance: Number(e.target.value) }))}
            fullWidth
            size="small"
          />
          {form.type === 'credit' && (
            <Typography variant="caption" sx={{ color: form.initial_balance > 0 ? '#FDB022' : 'text.secondary', fontWeight: 500, mt: -1.5 }}>
              {form.initial_balance > 0 ? 'Se convertirá a negativo automáticamente' : 'Ingresá el monto de tu deuda'}
            </Typography>
          )}
          {form.type !== 'credit' && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mt: -1.5 }}>
              Tu saldo actual en esta cuenta.
            </Typography>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Moneda</InputLabel>
            <Select
              value={form.currency}
              label="Moneda"
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            >
              <MenuItem value="MXN">MXN — Peso Mexicano</MenuItem>
              <MenuItem value="USD">USD — Dólar</MenuItem>
              <MenuItem value="EUR">EUR — Euro</MenuItem>
            </Select>
          </FormControl>

          {form.type === 'credit' && (
            <TextField
              label="Límite de Crédito"
              type="number"
              value={form.credit_limit}
              onChange={e => setForm(f => ({ ...f, credit_limit: Number(e.target.value) }))}
              fullWidth
              size="small"
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                color="primary"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Cuenta Activa</Typography>}
          />
        </DialogContent>
        <Divider sx={{ opacity: 0.08 }} />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setModalOpen(false)}
            disabled={saving}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #316ee9 0%, #0F1B4C 100%)',
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : (editingId ? 'Guardar Cambios' : 'Crear Cuenta')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        slotProps={{
          paper: { sx: { borderRadius: '20px', bgcolor: 'background.paper', minWidth: { xs: '90dvw', sm: 360 } } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Eliminar Cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ¿Estás seguro que querés eliminar{' '}
            <strong style={{ color: '#fff' }}>{deleteTarget?.name}</strong>?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Accounts;
