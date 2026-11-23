# AGENTS.md — Reglas operativas para agentes

Proyecto: **Registro de actividades** (UDB · DPS104 · Equipo 02 · Android con Expo + Supabase).

## 1. Fuente única de verdad (qué leer antes de tocar una issue)
Nunca adivines reglas de negocio, nombres de tablas ni rutas de pantallas. Antes de implementar una issue, lee **únicamente** los archivos enlazados en ella:
1. Reglas y Criterios de Aceptación: `docs/specs/`
2. Decisiones técnicas cerradas: `docs/adrs/`
3. Tablas, restricciones, RLS y RPCs (todo en español): `docs/database.md`
4. Pantalla(s) afectada(s): `docs/screens/SCREEN-*.md` y `docs/screens/README.md`
5. Guía de verificación manual para el humano: `docs/e2e-manual-guide.md`

## 2. Reglas de oro del proyecto
- **No inventar alcance:** respeta estrictamente los *No-Goals* en `docs/specs/00-general.md` y la sección *"Fuera de alcance"* de cada issue.
- **Separación Alta vs Media:** no implementes lógica de prioridad **Media** (`HU10`–`HU13`, `HU16`) dentro de una issue de prioridad **Alta**, salvo mantener intactos los campos/hooks ya previstos en `docs/database.md`.
- **Glosario de dominio:** en la BD y el código usamos **`jornadas`** (equivalente a *"actividades"* en el documento T1). Una jornada dura **un solo día** en zona horaria `America/El_Salvador` (UTC-6).
- **Base de datos en español:** respeta exactamente los nombres de tablas, columnas y funciones SQL en `docs/database.md` (en español, `snake_case`, sin tildes ni `ñ`).
- **Seguridad (RNF03):** jamás pongas `service_role` ni credenciales privadas en la app Expo. Toda autorización y validación sensible vive en **RLS** y en los **4 RPCs** de PostgreSQL.
- **Estados obligatorios en toda pantalla (RNF04):** toda vista con datos remotos o permisos debe manejar estado `cargando`, `vacío`, `error visible con reintento seguro` y denegación de permisos sin crashear.

## 3. Calidad y verificación (sin tests automatizados)
- **NO instales ni escribas tests automatizados** (sin Jest, Vitest ni Testing Library; ver `docs/adrs/ADR-005-gitflow-issues-y-calidad.md`).
- Antes de proponer cierre de una issue, ejecuta y verifica:
  - Chequear tipos TypeScript (`typecheck`).
  - Chequear estilo/errores estáticos (`lint`).
- Al terminar tu cambio, entrega al desarrollador humano el **guion de prueba manual E2E en Android** correspondiente para que valide de punta a punta antes de aprobar el PR.

## 4. Git Flow y cambios a specs
- Flujo de ramas: `main` (cortes `"Fase N"` de cada laboratorio) ← `develop` (integración diaria) ← rama de trabajo del integrante.
- Si una implementación requiere ajustar una regla de negocio, tabla o pantalla, actualiza el archivo correspondiente en `docs/` **en el mismo PR**.
- Nunca copies los Criterios de Aceptación completos en las issues: enlaza a los docs. Dentro de una issue usa URL absoluta a `develop` (`https://github.com/pgap22/registro-actividades-udb/blob/develop/docs/specs/...#huXX`); los enlaces relativos solo funcionan dentro de archivos del repo.

## 5. Leer issues con GitHub CLI (`gh`)
- **Recomendado:** antes de empezar una issue, el desarrollador o el agente debe tener instalada y autenticada la [GitHub CLI](https://cli.github.com/). Así la issue se lee desde la terminal, sin copiar y pegar desde el navegador.
  - Instalar: `winget install --id GitHub.cli` (Windows) · `brew install gh` (macOS) · ver https://cli.github.com/ para Linux.
  - Autenticar una sola vez: `gh auth login`.
- Si el agente detecta que `gh` no está instalado o autenticado, **debe recomendar instalarlo** al desarrollador antes de continuar, en lugar de adivinar el contenido de la issue.
- Comandos útiles:
  ```bash
  gh issue list --milestone "MVP · Alta"            # issues de un milestone
  gh issue list --search "[HU07]" --state all       # buscar por clave de historia
  gh issue view 12                                  # leer una issue (alcance, plan, E2E, DoD)
  gh issue view 12 --comments                       # incluir comentarios
  gh issue develop 12 --base develop --checkout     # crear rama de trabajo desde develop ligada a la issue
  gh pr create --base develop                       # abrir PR hacia develop
  ```

## 6. Skills de agentes
- **Fuente única:** `.agents/skills/`. Ahí se agregan o editan las skills del proyecto.
- `.claude/skills/` (Claude Code) y `.commandcode/skills/` (Command Code) son **copias** de `.agents/skills/` (sin symlinks, para evitar problemas en Windows). Al cambiar una skill, vuelve a copiarla en el mismo commit:
  ```bash
  rm -rf .claude/skills .commandcode/skills
  cp -r .agents/skills .claude/skills && cp -r .agents/skills .commandcode/skills
  ```
