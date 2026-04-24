# 🗄️ Database Agent Tasks - Overview Dashboard

Este agente debe garantizar que la capa de persistencia soporte las consultas agregadas del Dashboard de forma eficiente.

## Tareas Pendientes

### 1. Validación de Esquema
- [x] Verificar que la tabla `Events` tenga el campo `VenueAddress` migrado y accesible.
- [x] Validar que `Guests` tenga un campo de estado (`confirmed`, `pending`, `declined`) consistente con el ENUM del Backend.

### 2. Seguridad (RLS)
- [x] Implementar o revisar políticas de **Row Level Security** en Supabase para asegurar que un usuario solo pueda obtener el Overview de SUS propios eventos.

### 3. Rendimiento
- [x] Evaluar la creación de un índice en `Guests(event_id, status)` para acelerar los conteos de métricas del Dashboard.


## Hito 3: Auditoría & Performance
### 1. Optimización
- [ ] Revisar indexación en tabla `CheckIns` para conteos rápidos.

### 2. Auditoría
- [ ] Auditoría completa de políticas RLS para aislamiento de usuarios.

*Modelo Recomendado: Gemini 1.5 Pro (Precisión)*

## Notas de Sincronización
- Reportar al **Backend Developer** cualquier cambio en los nombres de las columnas.
