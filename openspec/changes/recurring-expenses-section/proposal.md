# Proposal: Recurring Expenses Section

## Intent

Permitir a los usuarios registrar gastos que se repiten automáticamente cada mes (recurrentes), eliminando la necesidad de crear manualmente las mismas transacciones cada período. El sistema ejecutará las recurrencias cuando el usuario abra la app.

## Scope

### In Scope
- Agregar API methods en `src/services/api.ts` para CRUD de `recurring_transactions`
- Nueva sección en `src/views/Transactions.tsx` para listar/crear recurrencias
- Lógica de ejecución automática: verificar recurrencias pendientes al abrir la app
- Calcular `next_execution_date` según frecuencia (monthly/weekly/yearly)

### Out of Scope
- Notificaciones push para recordatorios antes de ejecutar
- Edición masiva de recurrencias
- Integración con calendar apps

## Capabilities

### New Capabilities
- `recurring-expenses`: Capacidad de crear, listar, editar y eliminar gastos recurrentes
- `recurring-execution`: Ejecución automática de recurrencias pendientes

### Modified Capabilities
- Ninguna (es funcionalidad nueva)

## Approach

**Hybrid**: API methods + UI + client-side execution
1. Backend: agregar endpoints REST en Supabase para `recurring_transactions`
2. UI: nueva sección en Transactions.tsx con formulario y lista de recurrencias
3. Client: al cargar la app, verificar recurrencias con `next_execution_date <= now()` y auto-crear transactions

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/services/api.ts` | New | Métodos CRUD para `recurring_transactions` |
| `src/views/Transactions.tsx` | Modified | Nueva sección para recurrencias |
| `src/App.tsx` | Modified | Hook de ejecución automática |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Transacción duplicada | Med | Verificar si ya existe transacción con mismo `source_id` y fecha antes de crear |
| FK constraint error | Med | Validar que `category_id` y `account_id` existan antes de crear recurrencia |

## Rollback Plan

1. Revertir cambios en `api.ts` y `Transactions.tsx`
2. Los datos en Supabase permanecen (no se borran)
3. Eliminar función de verificación automática en `App.tsx`

## Dependencies

- Tabla `recurring_transactions` ya existe en Supabase
- API existente de transactions como referencia

## Success Criteria

- [ ] Usuario puede crear una recurrencia mensual desde la UI
- [ ] Usuario puede ver lista de recurrencias activas
- [ ] Al abrir la app, las recurrencias pendientes se convierten en transactions
- [ ] No se crean duplicados de la misma recurrencia en el mismo período