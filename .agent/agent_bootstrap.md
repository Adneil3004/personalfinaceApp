# Agent Bootstrap Template

This document provides a standard protocol for initializing an "Optimized Agent Context" in any new repository. This system reduces token consumption and improves the accuracy of AI tools (RAG).

## 1. Setup Directory
Create a `.agent/` directory at the root of the project.

## 2. Core Files
Initialize the following files:

| File | Purpose |
| :--- | :--- |
| `project_mapping.md` | A recursive tree of the project with semantic descriptions. |
| `current_context.md` | A snapshot of the current objective, subtasks, and decisions. |
| `skills_index.md` | An index of all available agent skills for quick lookup. |

## 3. Initialization Protocol
When starting a new project, follow these steps:

1. **Map Files**: Run a listing command and add semantic descriptions to the folders.
2. **Scan Skills**: List all available system skills and create a searchable index.
3. **Set Constraints**:
    - **Update Cycle**: Refresh `current_context.md` every 5 hours of work.
    - **Reading Limit**: Any file > 500 lines must be read in chunks of 200 lines or summarized.
    - **Exclusions**: Always exclude `node_modules`, `bin`, `obj`, `.git`, and the `.agent/` folder itself from bulk scans.

## 4. Maintenance Script (Reference)
Use a script like this to generate the mapping:
```python
# (Include the logic used in generate_project_mapping.py and enrich_mapping.py here)
```

## 5. Usage Guidelines
- **First Step**: Always check `current_context.md` to restore state.
- **Efficiency**: Use `project_mapping.md` to identify files instead of guessing with `grep`.
- **Compaction**: When the context feels "heavy" or slow, summarize recent tool outputs into `current_context.md`.
