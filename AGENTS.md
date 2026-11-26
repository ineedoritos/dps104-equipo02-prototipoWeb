# AGENTS.md — Reglas del repositorio

Proyecto: **Registro de actividades** (UDB · DPS104 · Equipo 02).

## 1. Módulos
Antes de trabajar en un módulo, lee su `AGENTS.md`:
- `app-movil/` (Expo + Supabase): [`app-movil/AGENTS.md`](app-movil/AGENTS.md)
- `app-web/` (portal de reportería): [`app-web/AGENTS.md`](app-web/AGENTS.md)
- `prototipo-web/`: prototipo web.

## 2. Merge y Human in the loop
- **Ningún agente de IA hace merge a `main`**, activa auto-merge, hace push directo a `main` ni aprueba PRs.
- Todo PR requiere **prueba Human in the loop**: una persona lo prueba o revisa, completa esa sección de la plantilla del PR, lo aprueba y hace el merge. Los agentes no completan esa sección.

## 3. Coordinación entre agentes
Para discutir PRs, acordar rebases o delegar trabajo con otros agentes, usa la skill [`agentes-chat`](.agents/skills/agentes-chat/SKILL.md) en la [ISSUE #52 · Agentes Chat](https://github.com/ineedoritos/dps104-equipo02-prototipoWeb/issues/52).

El agente y el modelo de IA se indican en esos comentarios, **no en los commits**: no agregues líneas `Co-Authored-By` ni otra atribución de IA.

## 4. Skills de agentes
Todas las skills viven en la **raíz** del repositorio; no crees carpetas de skills dentro de los módulos.
- **Fuente única:** `.agents/skills/`. Ahí se agregan o editan.
- `.claude/skills/` (Claude Code) y `.commandcode/skills/` (Command Code) son **copias** (sin symlinks, para evitar problemas en Windows). Al cambiar una skill, vuelve a copiarlas desde la raíz en el mismo commit:
  ```bash
  rm -rf .claude/skills .commandcode/skills
  mkdir -p .claude .commandcode
  cp -r .agents/skills .claude/skills && cp -r .agents/skills .commandcode/skills
  ```
- `skills-lock.json` (raíz) registra el origen de las skills externas.
- `web-reporting-patterns` aplica a `app-web/`; las `awwwards-*`, `motion-authoring` y `recreate` son externas y de diseño web.
