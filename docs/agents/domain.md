# Domain Docs

Cómo las skills de ingeniería deben consumir la documentación de dominio de este repo al explorar el código.

## Antes de explorar, leé esto

- **`CONTEXT.md`** en la raíz del repo.
- **`docs/adr/`** — leé los ADRs que tocan el área en la que vas a trabajar.

Si alguno de estos archivos no existe, **seguí adelante en silencio**. No marques su ausencia ni sugieras crearlos preventivamente. La skill productora (`/grill-with-docs`) los crea de manera perezosa cuando se resuelven términos o decisiones.

## Estructura de archivos

Este repo es **single-context** (un solo dominio):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-client-side-whisper.md
│   └── ...
└── src/
```

(Si en algún momento se convierte en multi-context, aparecería un `CONTEXT-MAP.md` en la raíz apuntando a `CONTEXT.md` por contexto.)

## Usá el vocabulario del glosario

Cuando tu output nombra un concepto de dominio (en un título de issue, una propuesta de refactor, una hipótesis, un nombre de test), usá el término como está definido en `CONTEXT.md`. No derives a sinónimos que el glosario evita explícitamente.

Si el concepto que necesitás no está todavía en el glosario, eso es una señal — o estás inventando lenguaje que el proyecto no usa (replanteá), o hay un gap real (anotalo para `/grill-with-docs`).

## Marcá conflictos con ADRs

Si tu output contradice un ADR existente, decilo explícitamente en vez de pisarlo en silencio:

> _Contradice ADR-0001 (Whisper 100% en el browser) — pero vale la pena reabrirlo porque…_
