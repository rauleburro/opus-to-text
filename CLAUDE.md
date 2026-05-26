# CLAUDE.md

Este archivo dirige a Claude Code al contrato de trabajo del repo.

**Las reglas, convenciones y referencias del proyecto viven en [`AGENTS.md`](./AGENTS.md). Leelo antes de tocar código.**

## Resumen rápido (en `AGENTS.md` está el detalle)

- **TDD obligatorio — siempre.** No se escribe código de implementación sin un test que falle primero. Ver la sección "TDD obligatorio" de `AGENTS.md`.
- Antes de commitear, deben pasar: `npm test`, `npm run typecheck`, y `npm run build` para cambios no triviales.
- Issues en GitHub (`gh issue ...`), labels canónicos en `docs/agents/triage-labels.md`.
- Glosario del dominio en [`CONTEXT.md`](./CONTEXT.md), decisiones arquitectónicas en [`docs/adr/`](./docs/adr/).

Para todo lo demás, leer `AGENTS.md`.
