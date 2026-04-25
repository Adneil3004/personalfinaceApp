import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress
} from '@mui/material';
import { api } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  ShoppingBag,
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
  Cell
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

// Tooltip formatter helper
const formatTooltipValue = (value: any): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }
  return String(value);
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

const SummaryCard = ({ title, value, icon, trend, color, highlighted = false, statusText }: any) => {
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
              {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: { xs: 24, md: 28, lg: 32 } } })}
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

const Dashboard = () => {
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
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: { xs: 2, md: 4 },
        mb: { xs: 4, md: 6 } 
      }}>
        {[
          {
            title: "Patrimonio Neto",
            value: stats?.totalBalance || 0,
            icon: <AccountBalanceWallet />,
            color: "#316ee9",
            highlighted: true
          },
          {
            title: "Gastos del Mes",
            value: stats?.monthlyExpenses || 0,
            icon: <ShoppingBag />,
            color: "#FDB022"
          },
          {
            title: (stats?.monthlySavings || 0) >= 0 ? "Superávit Mensual" : "Déficit Mensual",
            value: stats?.monthlySavings || 0,
            icon: (stats?.monthlySavings || 0) >= 0 ? <TrendingUp /> : <TrendingDown />,
            color: (stats?.monthlySavings || 0) >= 0 ? "#039855" : "#D92D20",
            highlighted: (stats?.monthlySavings || 0) < 0,
            statusText: (stats?.monthlySavings || 0) >= 0 ? "Saludable" : "Requiere Atención"
          },
          {
            title: "Capital (Débito)",
            value: stats?.totalAssets || 0,
            icon: <AccountBalance />,
            color: "#00A3E0"
          },
          {
            title: "Deuda (Crédito)",
            value: Math.abs(stats?.totalDebt || 0),
            icon: <TrendingDown />,
            color: "#D92D20"
          },
          {
            title: "Límite Crédito",
            value: stats?.creditLimit || 0,
            icon: <CreditCard />,
            color: "#81cfff"
          }
        ].map((card, index) => (
          <Box key={index} sx={{ 
            width: { 
              xs: 'calc(50% - 8px)', 
              sm: 'calc(50% - 8px)', 
              md: 'calc(33.33% - 21.33px)' 
            },
            minHeight: { xs: 150, md: 180 }
          }}>
            <SummaryCard {...card} />
          </Box>
        ))}
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
                        formatter={formatTooltipValue}
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
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: 2,
                overflow: 'hidden'
              }}>
                {stats?.expensesByCategory?.length > 0 ? (
                  <>
                    {/* Gráfico (Ancho Flexible) */}
                    <Box sx={{ 
                      flex: 1, 
                      minWidth: { xs: 150, md: 240 },
                      height: { xs: 250, md: 320 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.expensesByCategory}
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            {stats.expensesByCategory.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={formatTooltipValue}
                            contentStyle={{ backgroundColor: '#111927', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Lista (Ancho Fijo) */}
                    <Box sx={{ 
                      width: { xs: '180px', sm: '280px', md: '320px' }, 
                      flexShrink: 0,
                      maxHeight: { xs: 280, md: 320 }, 
                      overflowY: 'auto', 
                      pr: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.02)' },
                      '&::-webkit-scrollbar-thumb': { 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        borderRadius: '10px'
                      }
                    }}>
                      {stats.expensesByCategory.sort((a: any, b: any) => b.value - a.value).map((cat: any) => {
                        const totalExpenses = stats.expensesByCategory.reduce((sum: number, c: any) => sum + c.value, 0);
                        const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                        
                        return (
                          <Box key={cat.name} sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ 
                                fontWeight: 700, 
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '70%'
                              }}>
                                {cat.name}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                {formatCurrency(cat.value)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              position: 'relative',
                              width: '100%', 
                              height: { xs: 20, sm: 26 }, 
                              bgcolor: 'rgba(255,255,255,0.03)', 
                              borderRadius: '4px',
                              overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              <Box sx={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                bgcolor: cat.color,
                                borderRadius: '2px',
                                transition: 'width 1s ease-in-out'
                              }} />
                            </Box>
                          </Box>
                        );
                      })}
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
                            formatter={formatTooltipValue}
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
