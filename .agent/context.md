# FinanceControl 📊

## 1. Descripción del Proyecto
**FinanceControl** es una aplicación web local-first y móvil-adaptable diseñada para la gestión financiera personal de un desarrollador independiente. El sistema permite centralizar ingresos, egresos y ahorros, proporcionando una visualización analítica de alto impacto inspirada en dashboards de nivel corporativo para uso personal.

La aplicación está optimizada para ser utilizada como una **PWA (Progressive Web App)** y **escritorio**, permitiendo un acceso rápido desde el móvil para el registro de gastos diarios sin sacrificar la potencia de un análisis profundo en el escritorio.

### Características Principales (MVP):
* **Dashboard Analítico:** Visualización de KPIs (Ingresos vs. Gastos) y gráficas de tendencia mensual mediante componentes de alto rendimiento.
* **Gestión de Transacciones:** Registro rápido de ingresos y egresos con categorización inteligente.
* **Sincronización Cloud-Native:** Persistencia de datos en tiempo real para permitir la transición fluida entre el registro en el teléfono y el análisis en la PC.
* **Instalación PWA:** Acceso desde la pantalla de inicio del móvil con capacidad de carga instantánea y visualización a pantalla completa.

## 2. Objetivo
El objetivo primordial de FinanceControl es proporcionar una herramienta de soberanía financiera que permita al usuario tomar decisiones basadas en datos reales y llevar un flujo de dinero formal y profesional. Busca optimizar el flujo de caja personal y asegurar la provisión de gastos fijos y variables.

## 4. Stack Técnico (Confirmado)
Para garantizar la escalabilidad, la velocidad de desarrollo y el costo de mantenimiento cero, se ha seleccionado el siguiente stack:

* **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/) (Para un bundling ultrarrápido).
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y minimalista basado en utilidades).
* **Gráficos:** [Recharts](https://recharts.org/) (Librería de visualización de datos basada en React).
* **Base de Datos y Auth:** [Supabase](https://supabase.com/) (PostgreSQL administrado, autenticación de usuario y políticas RLS para seguridad de datos).
* **Estrategia Móvil:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (Transformación de la web en una Progressive Web App instalable).
