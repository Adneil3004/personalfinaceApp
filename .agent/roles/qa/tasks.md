# QA Lead Tasks

## Current Hito: Guest Deletion Integration
- [x] Fix URL mismatch in `Guests.jsx` for "Clear List".
- [x] Implement `DeleteGuestsCommandValidator` with FluentValidation.
- [x] Update `Event.RemoveGuest` and `Event.ClearGuests` to handle `CheckIns`.
- [x] Create unit tests for `DeleteGuestsHandler`.
- [x] Create unit tests for `DeleteAllGuestsHandler`.
- [x] Manual verification of the entire flow.

## Hito 3: Pruebas de Integración & UX
### 1. E2E Flows
- [ ] Crear scripts de prueba E2E para el flujo completo de "Guest Check-in".
- [ ] Validar persistencia de datos en el Dashboard tras el check-in.

### 2. UI/UX Verification
- [ ] Validar modales de confirmación en resoluciones móviles y tablet.
- [ ] Verificar que el efecto "Sheen" no degrade el rendimiento visual.

*Modelo Recomendado: Gemini 1.5 Pro (Precisión Crítica)*
