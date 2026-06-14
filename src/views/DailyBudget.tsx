import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Grid
} from '@mui/material';
import { api, type AccountDaySpend } from '../services/api';
import {
  AccountBalance,
  AttachMoney,
  CreditCard
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const ACCOUNT_ICONS = {
  checking: <AccountBalance />,
  cash: <AttachMoney />,
  credit: <CreditCard />
};

interface SpendCardProps {
  account: AccountDaySpend;
}

const SpendCard = ({ account }: SpendCardProps) => {
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
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 24px ${account.color}10`
      }}>
        <CardContent sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <Avatar sx={{
            bgcolor: `${account.color}20`,
            color: account.color,
            width: 56,
            height: 56
          }}>
            {React.cloneElement(ACCOUNT_ICONS[account.type] as React.ReactElement<{ sx?: object }>, { sx: { fontSize: 28 } })}
          </Avatar>
          <Box sx={{ mt: 'auto', width: '100%' }}>
            <Typography variant="body2" sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 0.5
            }}>
              {account.name}
            </Typography>
            <Typography variant="h4" sx={{
              fontWeight: 850,
              color: '#FFFFFF',
              fontSize: '1.75rem',
              fontFamily: '"Manrope", sans-serif',
              letterSpacing: '-0.02em'
            }}>
              {formatCurrency(account.spent)}
            </Typography>
            <Typography variant="caption" sx={{
              color: account.color,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
              mt: 0.5,
              display: 'block'
            }}>
              {account.spent > 0 ? 'Con gasto hoy' : 'Sin gasto hoy'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DailyBudget = () => {
  const [accounts, setAccounts] = React.useState<AccountDaySpend[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTodaySpendingByAccount();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching today spending:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{
          fontWeight: 900,
          color: '#FFFFFF',
          mb: 1,
          fontSize: { xs: '1.75rem', md: '2.5rem' },
          letterSpacing: '-0.02em'
        }}>
          Gasto de Hoy
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1.1rem' }, textTransform: 'capitalize' }}>
          {today}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid key={account.accountId} size={{ xs: 12, sm: 6, md: 4 }}>
            <SpendCard account={account} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DailyBudget;
