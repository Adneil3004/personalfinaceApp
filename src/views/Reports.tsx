import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { api } from '../services/api';

const Reports: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [accountData, setAccountData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener transacciones (últimas 1000 para reportes)
        const { data: transactions } = await api.getTransactions(0, 1000);
        
        // Filtrar solo gastos (exclude transfers if they are counted as expenses in some contexts)
        const expenses = transactions.filter(t => t.type === 'expense');

        // 1. Agrupar por Mes (Ingresos vs Gastos)
        const monthlyMap: Record<string, { income: number; expense: number }> = {};
        
        transactions.forEach(t => {
          if (t.type === 'transfer') return; // Ignorar transferencias para el balance neto
          
          const date = new Date(t.date + 'T00:00:00');
          const monthYear = date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
          
          if (!monthlyMap[monthYear]) {
            monthlyMap[monthYear] = { income: 0, expense: 0 };
          }
          
          if (t.type === 'income') {
            monthlyMap[monthYear].income += Number(t.amount);
          } else {
            monthlyMap[monthYear].expense += Number(t.amount);
          }
        });

        const monthlyArray = Object.keys(monthlyMap).map(name => ({
          name,
          income: monthlyMap[name].income,
          expense: monthlyMap[name].expense,
          net: monthlyMap[name].income - monthlyMap[name].expense
        })).reverse();

        // 2. Agrupar por Cuenta (Solo gastos para distribución)
        const accountMap: Record<string, number> = {};
        expenses.forEach(t => {
          const name = t.accounts?.name || 'Desconocida';
          accountMap[name] = (accountMap[name] || 0) + Number(t.amount);
        });

        const accountColors = ['#00A3E0', '#316ee9', '#002D72', '#81cfff', '#039855', '#D92D20', '#FDB022'];
        const accountArray = Object.keys(accountMap).map((name, index) => ({
          name,
          value: accountMap[name],
          color: accountColors[index % accountColors.length]
        }));

        setMonthlyData(monthlyArray);
        setAccountData(accountArray);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Reportes y Análisis
      </Typography>

      <Grid container spacing={3}>
        {/* Gráfico de Balance Histórico */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2, minHeight: 450, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Balance Histórico (Ingresos vs Gastos)
            </Typography>
            <Box sx={{ width: '100%', height: 350, mt: 2 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => {
                      const data = monthlyData.find(d => d.name === label);
                      if (data) {
                        return `${label} - Balance: ${formatCurrency(data.net)}`;
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Legend verticalAlign="top" align="right" height={36}/>
                  <Bar dataKey="income" name="Ingresos" fill="#039855" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Gastos" fill="#D92D20" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico por Cuenta */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, minHeight: 450, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Distribución por Cuenta
            </Typography>
            <Box sx={{ width: '100%', height: 350, mt: 2 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={accountData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {accountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
