import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  Button,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { api } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Notifications,
  Add as AddIcon,
  ShoppingBag,
  Restaurant,
  DirectionsCar,
  HomeWork,
  AccountBalance,
  CreditCard
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

// Los datos se obtienen dinámicamente desde el servicio api

// Función para formatear valores grandes con prefijos (K, M, B)
const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

// Función completa para tooltips y mostrar el valor completo
const formatCurrencyFull = (value: number): string => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const EmptyStateChart = ({ message = "No hay datos para mostrar" }) => (
  <Box sx={{ 
    height: '100%', 
    width: '100%',
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 2,
    opacity: 0.5,
    minHeight: 200
  }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', width: 56, height: 56 }}>
      <TrendingUp sx={{ fontSize: 28, color: 'text.secondary' }} />
    </Avatar>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textAlign: 'center' }}>
      {message}
    </Typography>
  </Box>
);

const SummaryCard = ({ title, value, icon, trend, color, highlighted = false }: any) => {
  const theme = useTheme();
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} style={{ height: '100%', width: '100%' }}>
      <Card sx={{
        height: '100%',
        aspectRatio: { xs: '1 / 1', sm: 'auto' },
        minHeight: { xs: 'auto', sm: 180, lg: 200 },
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
          p: { xs: 2, sm: 3 }, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'flex-start' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: { xs: 'center', sm: 'space-between' }, 
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            gap: 1
          }}>
            <Avatar sx={{
              bgcolor: highlighted ? 'rgba(255,255,255,0.2)' : `${color}20`,
              color: highlighted ? '#fff' : color,
              width: { xs: 48, md: 56, lg: 64 },
              height: { xs: 48, md: 56, lg: 64 },
              boxShadow: highlighted ? 'none' : `0 8px 16px ${color}15`
            }}>
              {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: { xs: 24, md: 28, lg: 32 } } })}
            </Avatar>
            {trend && (
              <Box sx={{ 
                bgcolor: trend > 0 ? 'rgba(3, 152, 85, 0.15)' : 'rgba(217, 45, 32, 0.15)',
                color: trend > 0 ? '#039855' : '#D92D20',
                px: 1, py: 0.5, borderRadius: '6px',
                display: 'flex', alignItems: 'center', gap: 0.5,
                position: { xs: 'absolute', sm: 'static' },
                top: 0, right: 0
              }}>
                {trend > 0 ? <TrendingUp sx={{ fontSize: 12 }} /> : <TrendingDown sx={{ fontSize: 12 }} />}
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>{Math.abs(trend)}%</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: { xs: 2, sm: 'auto' }, width: '100%' }}>
            <Typography variant="body2" sx={{
              color: highlighted ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem', lg: '1rem' },
              mb: 0.25,
              lineHeight: 1.2
            }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 850,
              color: '#FFFFFF',
              fontSize: { xs: '1.5rem', sm: '1.75rem', lg: '2rem' },
              fontFamily: '"Manrope", sans-serif',
              letterSpacing: '-0.02em'
            }}>
              {formatCurrency(value)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        flexDirection: 'column',
        alignItems: { xs: 'center', md: 'flex-start' },
        textAlign: { xs: 'center', md: 'left' },
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
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
            Bienvenido de nuevo a tu control financiero
          </Typography>
        </Box>
      </Box>

      {/* SUMMARY CARDS */}
      <Box sx={{ overflow: 'hidden', mb: { xs: 4, md: 6 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={6} sm={6} md={4}>
            <SummaryCard
              title="Patrimonio Neto"
              value={stats?.totalBalance || 0}
              icon={<AccountBalanceWallet />}
              color="#316ee9"
              highlighted
            />
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <SummaryCard
              title="Gastos del Mes"
              value={stats?.monthlyExpenses || 0}
              icon={<ShoppingBag />}
              color="#FDB022"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <SummaryCard
              title="Ahorro Mensual"
              value={stats?.monthlySavings || 0}
              icon={<TrendingUp />}
              color="#039855"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <SummaryCard
              title="Capital (Débito)"
              value={stats?.totalAssets || 0}
              icon={<AccountBalance />}
              color="#00A3E0"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <SummaryCard
              title="Deuda (Crédito)"
              value={Math.abs(stats?.totalDebt || 0)}
              icon={<TrendingDown />}
              color="#D92D20"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <SummaryCard
              title="Límite Crédito"
              value={stats?.creditLimit || 0}
              icon={<CreditCard />}
              color="#81cfff"
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* CHART: ACTIVIDAD DE GASTOS */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: { xs: 580, md: 450 }, borderRadius: '16px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Actividad de Gastos
              </Typography>
              <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
                {stats?.dailySpending?.some((d: any) => d.spend > 0) ? (
                  <ResponsiveContainer>
                    <AreaChart data={stats?.dailySpending || []}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00A3E0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}
                        contentStyle={{ backgroundColor: '#111927', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#fff' }}
                        itemStyle={{ color: '#00A3E0' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="spend" 
                        stroke="#00A3E0" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorSpend)" 
                        dot={{ r: 4, fill: '#00A3E0', strokeWidth: 2, stroke: '#1c2536' }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#FFFFFF' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyStateChart message="Sin actividad de gastos en los últimos 7 días" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CHART: GASTOS POR CATEGORÍA */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: { xs: 580, md: 450 }, borderRadius: '16px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Gastos por Categoría
              </Typography>
              <Box sx={{ 
                flex: 1, 
                width: '100%', 
                minHeight: 0,
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: { xs: 4, md: 2 } 
              }}>
                {stats?.expensesByCategory?.length > 0 ? (
                  <>
                    <Box sx={{ flex: { xs: '0 0 200px', md: '0 0 240px' }, height: { xs: 200, md: 300 }, width: '100%' }}>
                      <ResponsiveContainer>
                        <PieChart>
                            <Pie
                              data={stats.expensesByCategory}
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={0}
                              dataKey="value"
                              stroke="none"
                              strokeWidth={0}
                            >
                              {stats.expensesByCategory.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" strokeWidth={0} />
                              ))}
                            </Pie>
                          <Tooltip 
                            formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}
                            contentStyle={{ backgroundColor: '#111927', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      width: '100%',
                      maxHeight: { xs: 250, md: 320 }, 
                      overflowY: 'auto', 
                      pr: 1,
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }
                    }}>
                      <Grid container spacing={2}>
                        {stats.expensesByCategory.map((cat: any) => (
                          <Grid item xs={12} key={cat.name}>
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: '12px', 
                              bgcolor: 'rgba(255,255,255,0.02)', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': { transform: 'translateX(6px)', bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color, boxShadow: `0 0 10px ${cat.color}40` }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                  {cat.name}
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 850, color: '#FFFFFF' }}>
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cat.value)}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </>
                ) : (
                  <EmptyStateChart message="No hay gastos registrados este mes" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CHART: SALDOS POR CUENTA */}
        <Grid item xs={12}>
          <Card sx={{ height: '100%', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Saldos por Cuenta
              </Typography>
              <Box sx={{ height: 400, width: '100%', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {stats?.accountBalances?.some((a: any) => a.balance > 0) ? (
                  <>
                    <Box sx={{ width: { xs: '100%', lg: '50%' }, height: 320 }}>
                      <ResponsiveContainer>
                        <PieChart>
                            <Pie
                              data={stats.accountBalances.filter((a: any) => a.balance > 0)}
                              innerRadius={80}
                              outerRadius={130}
                              paddingAngle={0}
                              dataKey="balance"
                              nameKey="name"
                              stroke="none"
                              strokeWidth={0}
                            >
                              {stats.accountBalances.filter((a: any) => a.balance > 0).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" strokeWidth={0} />
                              ))}
                            </Pie>
                          <Tooltip
                            formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}
                            contentStyle={{ backgroundColor: '#111927', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ 
                      width: { xs: '100%', lg: '50%' }, 
                      maxHeight: 300, 
                      overflowY: 'auto', 
                      pr: 2,
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
                    }}>
                      <Grid container spacing={2}>
                        {stats.accountBalances.filter((a: any) => a.balance > 0).sort((a: any, b: any) => b.balance - a.balance).map((acc: any) => (
                          <Grid item xs={12} sm={6} lg={12} key={acc.name}>
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: '12px', 
                              bgcolor: 'rgba(255,255,255,0.02)', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'translateX(4px)', bgcolor: 'rgba(255,255,255,0.04)' }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: acc.color }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                  {acc.name}
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 850, color: '#FFFFFF' }}>
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(acc.balance)}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">No hay saldos positivos para mostrar</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
