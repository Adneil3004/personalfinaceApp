# 🚀 Prompt Técnico: Implementación de Vista Corporativa con Colores de Plataforma

**Contexto**: Implementar la vista de movimientos integrando los colores oficiales del proyecto (`src/theme/index.ts`) en la nueva estructura blanca/corporativa.

**Instrucciones para el Frontend Developer**:

1.  **Paleta de Colores de Plataforma**:
    - **Azul Azure (`#002D72`)**: Usar para TODOS los labels en mayúsculas ("MONTO", "CATEGORÍA", "FECHA", "DESCRIPCIÓN") y para el color de fondo del botón "Guardar Registro".
    - **Azul Sky (`#00A3E0`)**: Usar para iconos secundarios o estados destacados si es necesario.
    - **Blanco Puro (`#FFFFFF`)**: Fondo de la Card principal.
    - **Gris muy Claro (`#F3F4F6` o `#F8FAFC`)**: Fondo de los contenedores de input.

2.  **Estructura Detallada**:
    - **Card**: Radio 12px, sombra suave, fondo blanco.
    - **Monto**: Caja gris claro, texto 36px en Azul Azure (`#002D72`), centrado.
    - **Fila Media**: Flexbox para Categoría y Fecha. Labels en Azul Azure.
    - **Descripción**: Textarea alto, fondo gris claro, placeholder gris.
    - **Botón**: Centrado, Azul Azure sólido, icono de Save + texto en blanco.

3.  **Localización**:
    - Idioma: 100% Español.

4.  **Lógica**:
    - Cuenta automática (`accounts[0].id`).
    - Fetch de categorías desde Supabase.

---
*Fin del Prompt Técnico. Proceder a la ejecución inmediata en Transactions.tsx.*
