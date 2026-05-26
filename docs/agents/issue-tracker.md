# Issue tracker: GitHub

Issues y PRDs de este repo viven como GitHub Issues en `rauleburro/opus-to-text`. Usá la CLI `gh` para todas las operaciones.

## Convenciones

- **Crear un issue**: `gh issue create --title "..." --body "..."`. Usá heredoc para bodies multi-línea.
- **Leer un issue**: `gh issue view <number> --comments`, filtrando comentarios con `jq` y trayendo labels.
- **Listar issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` con filtros `--label` y `--state` apropiados.
- **Comentar en un issue**: `gh issue comment <number> --body "..."`
- **Aplicar / quitar labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Cerrar**: `gh issue close <number> --comment "..."`

El repo se infiere automáticamente de `git remote -v` cuando `gh` corre dentro del clone.

## Cuando una skill dice "publicar al issue tracker"

Crear un GitHub Issue.

## Cuando una skill dice "traer el ticket relevante"

Correr `gh issue view <number> --comments`.
