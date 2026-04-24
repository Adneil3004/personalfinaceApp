# Project File Mapping: FinanceControl

## 🏦 Proyecto: FinanceControl
**Identidad**: Sistema de gestión financiera personal y corporativa con estética "Luxury Dark" y arquitectura orientada a servicios (Supabase).

## 📂 Estructura de Archivos (Semántica)

### ⚙️ Configuración y Entorno
- [`.env`](file:///Volumes/DHstorage/source/FinanceControl/.env): **CRÍTICO**. Contiene `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del proyecto `uhktkekrgkldozrxfxrm`.
- [`.env.local`](file:///Volumes/DHstorage/source/FinanceControl/.env.local): Credenciales de base de datos local y Project ID.
- [`supabase/config.toml`](file:///Volumes/DHstorage/source/FinanceControl/supabase/config.toml): Configuración del CLI de Supabase (puertos locales, ID de proyecto).

### 🧠 Lógica de Negocio (Core)
- [`src/services/api.ts`](file:///Volumes/DHstorage/source/FinanceControl/src/services/api.ts): 
  - **Cálculo de Saldos**: `current_balance = initial_balance + sum(income) - sum(expense)`.
  - **Fórmula de Patrimonio Neto**: `Patrimonio = Activos (Debito/Efectivo) + Pasivos (Deuda Credito)`.
  - **Transferencias**: Lógica atómica que resta de una cuenta y suma a otra usando una categoría especial.
  - **Estadísticas**: Agregaciones mensuales para KPIs y gráficos.

### 🎨 Interfaz de Usuario (UI/UX)
- [`src/views/Dashboard.tsx`](file:///Volumes/DHstorage/source/FinanceControl/src/views/Dashboard.tsx): Visualización de KPIs y analíticas con Recharts.
- [`src/views/Transactions.tsx`](file:///Volumes/DHstorage/source/FinanceControl/src/views/Transactions.tsx): Gestión de movimientos. Optimizado para entrada rápida de datos.
- [`src/views/Accounts.tsx`](file:///Volumes/DHstorage/source/FinanceControl/src/views/Accounts.tsx): CRUD de entidades financieras.
- [`src/theme/index.ts`](file:///Volumes/DHstorage/source/FinanceControl/src/theme/index.ts): Sistema de diseño basado en MUI con paleta Azure/Sky Blue.

### 🔐 Autenticación y Estado
- [`src/store/useAuthStore.ts`](file:///Volumes/DHstorage/source/FinanceControl/src/store/useAuthStore.ts): Persistencia de sesión con Zustand.
- [`src/services/supabase.ts`](file:///Volumes/DHstorage/source/FinanceControl/src/services/supabase.ts): Inicialización del cliente JS.

## ⚖️ Reglas de Negocio (Business Rules)
1. **Signos de Saldo**: Las cuentas de crédito DEBEN inicializarse con saldo negativo si hay deuda. El sistema corrige automáticamente ingresos positivos en saldos iniciales de crédito a negativo.
2. **Transferencias**: No son un gasto real, sino un movimiento entre cuentas. Se registran como un par (Egreso/Ingreso) vinculado.
3. **Categorización**: Cada transacción DEBE pertenecer a una categoría para alimentar los gráficos de "Gastos por Categoría".
4. **Cálculo de Patrimonio**: 
   - `Activos = Suma(Saldos de cuentas 'checking' y 'cash')`.
   - `Deuda = Suma(Saldos de cuentas 'credit')`.
   - `Patrimonio Neto = Activos + Deuda` (Recordar que Deuda es negativa).

## 🛠️ Base de Datos (Supabase)
- [`supabase/seed.sql`](file:///Volumes/DHstorage/source/FinanceControl/supabase/seed.sql): Datos iniciales.
- **Tablas Principales**: `accounts`, `transactions`, `categories`, `profiles`.
- **Constraint**: La tabla `accounts` requiere la columna `credit_limit` para el funcionamiento de las estadísticas de crédito.

