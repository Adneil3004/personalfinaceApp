# 📈 UX Strategy: Precision Finance (FinanceControl)

Este documento define la estrategia de experiencia de usuario y los principios de diseño para **FinanceControl**. Es la guía técnica y estética para construir una plataforma de gestión financiera personal de alto impacto.

## 1. El Concepto: "The Analytical Fortress" (La Fortaleza Analítica)
Nuestra "North Star" creativa es la claridad absoluta y la soberanía de los datos. No es solo un rastreador de gastos; es un centro de comando para la toma de decisiones financieras.

La filosofía visual se define como **"Corporate Modernism"**. Buscamos la sofisticación de los dashboards financieros de nivel empresarial aplicada a la esfera personal. El diseño debe transmitir seguridad, precisión y eficiencia.

**Pilares del Concepto Visual:**
- **Claridad de Datos**: La información financiera debe ser legible a primera vista. Menos es más.
- **Jerarquía Funcional**: Los KPIs más importantes (Saldo Total, Flujo de Caja) dominan la vista.
- **Confianza Visual**: El uso de una paleta de azules profundos y tipografía geométrica evoca estabilidad y profesionalismo.

---

## 2. La Regla de Oro: "Structure through Depth"
**Queda prohibido el uso excesivo de bordes de 1px.**
- La jerarquía se define mediante:
  - **Elevación y Sombras**: Sombras sutiles y difusas para separar tarjetas del fondo.
  - **Contraste Tonal**: Uso de superficies neutras (`#F8F9FA`) vs el blanco puro para zonificación.
  - **Espaciado Matemático**: Siguiendo una escala de 4px/8px para mantener un ritmo visual constante.

---

## 3. Estrategia Tipográfica (Legibilidad y Ritmo)
El maridaje tipográfico está optimizado para la densidad de datos.

- **Manrope (La Voz del Análisis)**: Usada para encabezados, números grandes y títulos de secciones. Su naturaleza geométrica aporta un aire moderno y tecnológico.
- **Inter (La Voz de la Interfaz)**: Usada para el cuerpo de texto, etiquetas, formularios y tablas. Es la fuente estándar de oro para legibilidad en pantallas.

**Regla de Oro**: Los números (importes) deben usar variantes de ancho fijo (tabular figures) cuando se presentan en columnas para facilitar la comparación visual.

---

## 4. Paleta de Colores (The Precision Palette)
La paleta está inspirada en la fidelidad y la calma de las instituciones financieras modernas.

- **Primary (Deep Navy)**: `#002D72` - El color de la autoridad y la estabilidad. Usado en headers principales y elementos de marca.
- **Secondary (Royal Blue)**: `#0056D2` - Para acciones primarias, botones y elementos destacados.
- **Tertiary (Cerulean)**: `#00A3E0` - Para estados informativos, visualización de datos secundarios y acentos.
- **Neutral (Ghost White)**: `#F8F9FA` - El lienzo de fondo que permite que la data respire.
- **Danger (Signal Red)**: `#D92D20` - (Estimado de la referencia) Para gastos críticos, alertas y acciones destructivas (como borrar).

---

## 5. Micro-interacciones (The Responsive Feedback)
La interactividad debe ser "snappy" (rápida) y gratificante.
- **Transiciones**: Animaciones cortas (**150ms - 250ms**) para estados de hover y carga.
- **Feedback Táctil**: Los botones deben tener un estado de "active" (presionado) claro.
- **Data Loading**: Skeleton screens en lugar de spinners genéricos para mantener la estructura visual mientras los datos de Supabase se cargan.

---

## 6. UX IA: Inteligencia Financiera
- **Dashboards Adaptativos**: El dashboard cambia su enfoque si detecta una anomalía en los gastos del mes.
- **Registro Veloz**: Minimizar los clics para registrar un gasto. El foco debe estar en la velocidad de entrada desde el móvil (PWA).
- **Contexto Operativo**: Separar visualmente los gastos personales de los profesionales (SaaS) mediante tags o secciones claras.

---
*Este documento es la ley. Cualquier diseño o código que no respete estos principios debe ser refactorizado.*

