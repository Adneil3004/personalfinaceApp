# 🦾 FinanceControl Agent Orchestration Hub (Engram Pattern)

Este es el centro de mando para la orquestación de agentes en el proyecto FinanceControl. Sigue el patrón desarrollado por **Gentleman Programming** en el proyecto **Engram**.

## 🎯 Meta del Proyecto
Construir una plataforma de gestión financiera personal "Precision Finance" con una arquitectura moderna (React + Vite + Supabase) y una experiencia de usuario premium.

## 🧠 Trigger-Based Skills (Habilidades por Activación)

| Trigger (Cuando yo...) | Carga esta Habilidad (SKILL) | Propósito |
| :--- | :--- | :--- |
| **Inicio una sesión** | [.agent/agent_bootstrap.md](file:///.agent/agent_bootstrap.md) | Preparar el contexto y el rol de Managin. |
| **Modifico el Backend** | [.agent/skill/backend-architecture.md](file:///.agent/skill/backend-architecture.md) | Mantener Clean Architecture y CQRS. |
| **Diseño la UI** | [.agent/skill/ui-concierge.md](file:///.agent/skill/ui-concierge.md) | Asegurar estética "Concierge" y refinamiento. |
| **Finalizo una tarea** | [.agent/roles/managin/agent_logs.md](file:///.agent/roles/managin/agent_logs.md) | Reportar al Director y actualizar memoria. |

## 🛡️ Global Guardrails (Barreras de Seguridad)

- **Nunca** hagas commits sin antes categorizar la tarea.
- **Siempre** usa el API interna para operaciones de datos, evitando llamadas directas a Supabase en el frontend (excepto auth).
- **Manten** el `project_mapping.md` actualizado cada vez que descubras o crees una estructura importante.
- **Respeta** la jerarquía del rol **Managin** (Director) para la toma de decisiones arquitectónicas.

## 📂 Memoria del Proyecto (Engrams)
Las decisiones técnicas críticas se registran en `docs/ENGRAMS.md` para persistencia histórica.
