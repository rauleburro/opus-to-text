# AGENTS.md

Guía para agentes de IA (Claude Code, Cursor, Aider, etc.) que trabajen en este repo.

## Reglas del proyecto

### TDD obligatorio — siempre

**No se escribe código de implementación sin un test que falle primero.** Esto aplica a todos los módulos: lógica pura, hooks, componentes UI y workers (cuando es factible). Las únicas excepciones aceptadas son:

- Wiring trivial donde el comportamiento se valida en tests del módulo de nivel superior (p. ej. composición en `App`).
- Glue con APIs externas que no se pueden testear sin mocks pesados (p. ej. el `transcriber-worker` que llama a transformers.js). En esos casos, el comportamiento se valida con tests del hook que lo consume vía worker mock.

**Flujo esperado en cada cambio:**

1. Escribir el test (RED). El test debe describir el comportamiento desde el punto de vista del consumidor del módulo, no detalles internos.
2. Ejecutar el test y confirmar que falla por la razón correcta.
3. Escribir el mínimo código para hacerlo pasar (GREEN).
4. Refactorizar si hace falta, manteniendo todos los tests verdes.

**Antes de commitear cualquier cambio, deben pasar:**

- `npm test` (Vitest, modo CI)
- `npm run typecheck`
- `npm run build` para cambios no triviales

**Si un agente está por hacer un commit sin tests, debe detenerse y escribirlos primero**, aún si eso significa retroceder código ya escrito. No hay excepción tácita.

### Convenciones de tests

- Test runner: **Vitest** + **happy-dom** + **@testing-library/react**.
- Estructura: `*.test.ts(x)` co-locado con el archivo bajo test.
- Fixtures de audio: `tests/fixtures/` con archivos cortos (≤2s) generados con `ffmpeg`. Commiteados al repo (excepción explícita en `.gitignore`).
- Solo testear **comportamiento externo** (inputs → outputs visibles), no detalles de implementación.

## Agent skills

### Issue tracker

Issues viven en GitHub Issues del repo (`rauleburro/opus-to-text`), accedidos vía la CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Cinco roles canónicos con los nombres por defecto (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Ver `docs/agents/triage-labels.md`.

### Domain docs

Single-context: un solo `CONTEXT.md` y un solo `docs/adr/` en la raíz del repo. Ver `docs/agents/domain.md`.
