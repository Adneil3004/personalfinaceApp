# 🏗️ Architect Tasks - Attenda Architecture Alignment

Este agente es responsable de asegurar la coherencia técnica entre Supabase y el Backend de .NET Core, garantizando que la seguridad y el flujo de datos sean óptimos.

## Hito 1: Alineación de Seguridad y Auth
### 1. Sincronización de Identidad
- [ ] Analizar la estructura del JWT de Supabase y cómo mapearlo a los `Claims` de .NET Core.
- [ ] Definir el middleware de autenticación para validar tokens de forma consistente.

### 2. Auditoría de Flujo Dashboard
- [ ] Validar la estructura de datos propuesta por el Backend para el Dashboard.
- [ ] Asegurar que el frontend recibe los datos en el formato más eficiente para evitar lógica pesada en el navegador.

### 3. Integridad de Dominio
- [ ] Revisar que las futuras extensiones del evento (regalos, locaciones, etc.) sigan el patrón de Agregados de la arquitectura limpia.

*Modelo Recomendado: Gemini 1.5 Pro (Pensamiento Sistémico)*

---
## Notas de Contexto
- Foco principal: Resolver la disparidad de Auth para que el Backend sea la fuente de verdad.
- Mantener sincronía entre las políticas RLS y la integridad de datos en Postgres.
