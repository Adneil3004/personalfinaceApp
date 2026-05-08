import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import { CreditCard, LocalGasStation, Calculate } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Constantes del sistema Puntos Premia Citibanamex Oro
const RATE_GENERAL = 0.07;      // 7% compras estándar
const RATE_GASOLINA = 0.14;     // 14% estaciones de servicio
const VALOR_PUNTO_MXN = 0.10;   // $0.10 MXN por punto

interface RewardsResult {
  puntosAcumulados: number;
  montoRecuperado: number;
}

const calcularPremia = (monto: number, esGasolina: boolean, esMSI: boolean): RewardsResult => {
  // Regla 1: MSI no genera recompensas
  if (esMSI) {
    return { puntosAcumulados: 0, montoRecuperado: 0 };
  }

  // Regla 2: Determinar tasa de acumulación
  const factor = esGasolina ? RATE_GASOLINA : RATE_GENERAL;

  // Regla 3: Redondeo hacia abajo por transacción individual
  const puntos = Math.floor(monto * factor);
  const pesos = puntos * VALOR_PUNTO_MXN;

  return {
    puntosAcumulados: puntos,
    montoRecuperado: pesos
  };
};

const RewardsCalculator = () => {
  const [monto, setMonto] = useState<string>('');
  const [esGasolina, setEsGasolina] = useState(false);
  const [esMSI, setEsMSI] = useState(false);
  const [resultado, setResultado] = useState<RewardsResult | null>(null);
  const [historial, setHistorial] = useState<{monto: number, puntos: number, pesos: number, tipo: string}[]>([]);

  const handleCalcular = () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setResultado(null);
      return;
    }

    const res = calcularPremia(montoNum, esGasolina, esMSI);
    setResultado(res);

    if (res.puntosAcumulados > 0) {
      setHistorial(prev => [{
        monto: montoNum,
        puntos: res.puntosAcumulados,
        pesos: res.montoRecuperado,
        tipo: esGasolina ? 'Gasolina' : 'General'
      }, ...prev].slice(0, 10));
    }
  };

  const handleLimpiar = () => {
    setMonto('');
    setEsGasolina(false);
    setEsMSI(false);
    setResultado(null);
  };

  const totalPuntos = historial.reduce((acc, h) => acc + h.puntos, 0);
  const totalPesos = historial.reduce((acc, h) => acc + h.pesos, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* HEADER */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography variant="h3" sx={{
          fontWeight: 900,
          color: '#FFFFFF',
          mb: 1,
          fontSize: { xs: '1.75rem', md: '2.5rem' },
          letterSpacing: '-0.02em'
        }}>
          Calculadora Premia
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
          Calcula tus puntos y cashback de Citibanamex Oro
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* FORMULARIO */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  bgcolor: 'rgba(49,110,233,0.1)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex'
                }}>
                  <CreditCard sx={{ color: '#316ee9', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Nueva Transacción
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Monto de la compra"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                sx={{ mb: 3 }}
                slotProps={{
                  input: {
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }
                }}
              />

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={esGasolina}
                      onChange={(e) => setEsGasolina(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FDB022'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#FDB022'
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalGasStation sx={{ color: esGasolina ? '#FDB022' : 'text.secondary', fontSize: 20 }} />
                      <Typography>Es compra en gasolina</Typography>
                    </Box>
                  }
                />
                {esGasolina && (
                  <Typography variant="caption" sx={{ display: 'block', ml: 6, color: '#FDB022' }}>
                    Tasa aplicada: 14% (el doble)
                  </Typography>
                )}
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={esMSI}
                    onChange={(e) => setEsMSI(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00A3E0'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#00A3E0'
                      }
                    }}
                  />
                }
                label={
                  <Typography>Meses Sin Intereses (MSI)</Typography>
                }
              />

              {esMSI && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Las compras en MSI no generan puntos Premia
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Calculate />}
                  onClick={handleCalcular}
                  fullWidth
                  sx={{
                    bgcolor: '#316ee9',
                    borderRadius: '12px',
                    py: 1.5,
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#2857c4' }
                  }}
                >
                  Calcular
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleLimpiar}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.4)' }
                  }}
                >
                  Limpiar
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* RESULTADO */}
          {resultado && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ borderRadius: '16px', mt: 3, bgcolor: 'rgba(49,110,233,0.05)', border: '1px solid rgba(49,110,233,0.2)' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Puntos Acumulados
                  </Typography>
                  <Typography variant="h2" sx={{
                    fontWeight: 900,
                    color: '#316ee9',
                    fontSize: { xs: '2.5rem', md: '3rem' }
                  }}>
                    {resultado.puntosAcumulados.toLocaleString('es-MX')}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#00c853', fontWeight: 700, mt: 1 }}>
                    = ${resultado.montoRecuperado.toFixed(2)} MXN
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>

        {/* RESUMEN Y HISTORIAL */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Tasas de Acumulación
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Compras General
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                      7%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      1 punto por cada $1.43
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(253,176,34,0.1)',
                    border: '1px solid rgba(253,176,34,0.3)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" sx={{ color: '#FDB022' }}>
                      Gasolina
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDB022' }}>
                      14%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      1 punto por cada $0.71
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Equivalencia: 1 punto = $0.10 MXN
              </Typography>
            </CardContent>
          </Card>

          {/* HISTORIAL */}
          {historial.length > 0 && (
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Historial Reciente
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Total puntos: <strong style={{ color: '#316ee9' }}>{totalPuntos.toLocaleString('es-MX')}</strong>
                    </Typography>
                    <br />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Total cashback: <strong style={{ color: '#00c853' }}>${totalPesos.toFixed(2)}</strong>
                    </Typography>
                  </Box>
                </Box>

                {historial.map((h, index) => (
                  <Box key={index} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: index < historial.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${h.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: h.tipo === 'Gasolina' ? '#FDB022' : 'text.secondary' }}>
                        {h.tipo}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#316ee9' }}>
                        +{h.puntos} pts
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00c853' }}>
                        +${h.pesos.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RewardsCalculator;