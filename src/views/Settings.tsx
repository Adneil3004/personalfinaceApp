import React from 'react';
import { Box, Typography, Card, CardContent, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';

const Settings = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#fff' }}>
        Configuración
      </Typography>

      <Card sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Preferencias</Typography>
          <List>
            <ListItem>
              <ListItemText primary="Modo Oscuro" secondary="Mantener la interfaz en tema oscuro" />
              <ListItemSecondaryAction>
                <Switch checked disabled />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ opacity: 0.1 }} />
            <ListItem>
              <ListItemText primary="Notificaciones" secondary="Recibir alertas de gastos inusuales" />
              <ListItemSecondaryAction>
                <Switch defaultChecked />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Información</Typography>
          <Typography variant="body2" color="text.secondary">
            FinanceControl v1.0.0
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Desarrollado con ❤️ para tu libertad financiera.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
