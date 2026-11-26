# AGENTS.md — Reglas del repositorio

Proyecto: **Registro de actividades** (UDB · DPS104 · Equipo 02).

## 1. Modulos
Antes de trabajar en un modulo, lee su `AGENTS.md`:
- `app-movil/` (Expo + Supabase): [`app-movil/AGENTS.md`](app-movil/AGENTS.md)
- `app-web/` (portal de reporteria): [`app-web/AGENTS.md`](app-web/AGENTS.md)
- `prototipo-web/`: prototipo web.

## 2. Merge y Human in the loop
- **Ningun agente de IA hace merge a `main`**, activa auto-merge, hace push directo a `main` ni aprueba PRs.
- Todo PR requiere **prueba Human in the loop**: una persona lo prueba o revisa, completa esa seccion de la plantilla del PR, lo aprueba y hace el merge. Los agentes no completan esa seccion.

## 3. Ramas (Git Flow ligero)
Basado en `app-movil/docs/adrs/ADR-005-gitflow-issues-y-calidad.md`.
- `main`: rama de integracion y de los cortes "Fase N". Solo recibe PR que una persona haya probado.
- `develop`: opcional. Si el equipo la habilita, los PR de trabajo apuntan a `develop` y los cortes se integran en `main`.
- Nombres de rama (minusculas, guiones, sin acentos ni espacios):
  - `feature/<issue>-<descripcion>`: historias, setup, UI y documentacion. Ejemplo: `feature/41-web-setup-01`. Sin issue: `feature/docs-<descripcion>`.
  - `bugfix/<issue>-<descripcion>`: correccion de un bug que ya esta en la rama base.
  - `hotfix/<descripcion>`: correccion urgente sobre `main`.
  - `release/fase-<N>`: solo si un corte necesita ajustes finales antes de integrarse a `main`.
- Crea cada rama desde `main` (o `develop`, si existe) y sincronizala a diario con su rama base.
- Un PR por rama, pequeno, hacia `main` (o `develop`).
- No uses prefijos `feat/`, `ft-`, `rama-` ni nombres personales en ramas nuevas. Las ramas que ya existen no se renombran.
- Ningun agente hace push directo a `main`.

## 4. Coordinacion entre agentes
Para discutir PRs, acordar rebases o delegar trabajo con otros agentes, usa la skill [`agentes-chat`](.agents/skills/agentes-chat/SKILL.md) en la [Discussion #60 · Agentes Chat](https://github.com/ineedoritos/dps104-equipo02-prototipoWeb/discussions/60).

**Transicion:** el bloque de interfaz en marcha (`T-f1f6-1` a `T-f1f6-5`: issues #41, #42, #7, #8 y #9) **se termina en la [issue #52](https://github.com/ineedoritos/dps104-equipo02-prototipoWeb/issues/52)**, con comentarios seguidos. Cuando termine, la siguiente tarea ya va en la Discussion #60. Lo siguiente aplica a la #60:

- **Un hilo por tarea o tema:** se delega abriendo un hilo, y quien la toma, pregunta o entrega **responde dentro de ese hilo**.
- **Emotes en el mensaje raiz** como estado: 👀 revisando · 🚀 en progreso · 😕 duda o bloqueo · 🎉 entregado por el agente.
- Los emotes son solo una senal visual: no toman tareas, no cuentan como voto y **nunca** son prueba Human in the loop ni aprobacion.
- Lee y publica con `node .agents/skills/agentes-chat/sala.mjs` (filtra autores no confiables).
- **Agentes en Windows: no usen PowerShell para escribir texto** (comentarios, descripciones de PR o de issues). La comilla invertida es su caracter de escape y deja el mensaje ilegible. Escribe un archivo con tu herramienta de escritura y publicalo con `sala.mjs` o `--body-file`.
- Los textos publicados en GitHub se escriben **sin tildes**.

El agente y el modelo de IA se indican en esos comentarios, **no en los commits**: no agregues lineas `Co-Authored-By` ni otra atribucion de IA.

## 5. Skills de agentes
Todas las skills viven en la **raiz** del repositorio; no crees carpetas de skills dentro de los modulos.
- **Fuente unica:** `.agents/skills/`. Ahi se agregan o editan.
- `.claude/skills/` (Claude Code) y `.commandcode/skills/` (Command Code) son **copias** (sin symlinks, para evitar problemas en Windows). Al cambiar una skill, vuelve a copiarlas desde la raiz en el mismo commit:
  ```bash
  rm -rf .claude/skills .commandcode/skills
  mkdir -p .claude .commandcode
  cp -r .agents/skills .claude/skills && cp -r .agents/skills .commandcode/skills
  ```
- `skills-lock.json` (raiz) registra el origen de las skills externas.
- `web-reporting-patterns` aplica a `app-web/`; las `awwwards-*`, `motion-authoring` y `recreate` son externas y de diseno web.
- En `AGENTS.md` y en las skills propias se escribe **sin tildes**.
