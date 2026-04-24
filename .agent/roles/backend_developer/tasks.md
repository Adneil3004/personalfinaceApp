# ⚙️ Backend Developer Tasks - Guest Deletion

Este agente debe implementar la capacidad de eliminar invitados de forma individual, selectiva (varios a la vez) y masiva (todos).

## Tareas Pendientes

### 1. Modificar Dominio
- [x] En `Attenda.Domain/Aggregates/EventAggregate/Event.cs`:
  - Añadir `RemoveGuests(IEnumerable<Guid> guestIds)`.
  - Añadir `ClearGuests()`.

### 2. Comandos MediatR
- [x] Crear `DeleteGuestsCommand.cs` en `Attenda.Application/Guests/Commands/DeleteGuests/`.
  - Debe recibir una lista de `GuestIds`.
- [x] Crear `DeleteAllGuestsCommand.cs` en `Attenda.Application/Guests/Commands/DeleteAllGuests/`.
  - Debe recibir un `EventId`.

### 3. API Controller
- [x] Crear `GuestsController.cs` en `Attenda.API/Controllers/`.
- [x] Implementar `DELETE /api/guests/batch` (recibe lista de IDs en el body).
- [x] Implementar `DELETE /api/guests/event/{eventId}/all` (borrado masivo).


## Hito 3: Dashboard & Seguridad
### 1. Consultas de Dashboard
- [x] Implement `GetEventDashboardQuery` en `Attenda.Application`.
- [x] Calcular estadísticas: Total invitados, Check-ins hoy, Total Checked-in.

### 2. Mantenimiento
- [x] Resolver vulnerabilidad de `AutoMapper` actualizando a v13+.

*Modelo Recomendado: Gemini 1.5 Pro (Razonamiento Lógico)*

## Notas de Sincronización
- Asegurar que el borrado sea definitivo (hard delete) según los requerimientos.
- Validar que el usuario sea el dueño del evento antes de borrar invitados.
