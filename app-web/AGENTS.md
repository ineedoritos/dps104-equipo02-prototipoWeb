# AGENTS.md — Reglas operativas para agentes (`app-web`)

Proyecto: **Registro de actividades · Portal Web de Reportería** (UDB · DPS104 · Equipo 02 · Next.js + Tailwind CSS + shadcn/ui + Supabase).

## 1. Fuente única de verdad (qué leer antes de tocar una issue)
Nunca adivines reglas de negocio, nombres de tablas ni rutas de pantallas. Antes de implementar una issue `[WEB-*]`, lee **únicamente** los archivos enlazados en ella:
1. Reglas y Criterios de Aceptación web: `app-web/docs/specs/`
2. Decisiones técnicas cerradas web: `app-web/docs/adrs/`
3. Contrato único de Base de Datos (compartido con móvil, todo en español): `../app-movil/docs/database.md`
4. Pantalla(s) afectada(s): `app-web/docs/screens/WEB-SCREEN-*.md` y `app-web/docs/screens/README.md`
5. Guía de verificación manual para el humano: `app-web/docs/e2e-manual-guide.md`

## 2. Reglas de oro de `app-web`
- **Portal de solo lectura, reportería y exportación client-side:** `app-web` sirve para consultar estadísticas, dashboards, reportes de participación, historial personal y exportar a PDF/Excel en el navegador. **No** dupliques flujos operativos de captura (crear jornadas, pasar lista, generar/escanear QR), que pertenecen a `app-movil`.
- **Sin backend propio:** prohibido crear API Routes, Server Actions con `service_role`, microservicios o servidores intermedios para lógica de negocio o generación de archivos. Toda lectura va directa al proyecto Supabase compartido usando **RLS** y **RPCs** con la `anon key` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Exportación 100% Client-Side (`RNF-WEB-02`):** tanto PDF (`jspdf` + `jspdf-autotable`) como Excel (`xlsx-style` / `xlsx-js-style`) se generan exclusivamente en el navegador del usuario con los datos ya autorizados por Supabase.
- **Acceso por rol en cada grupo (no rol global):** cualquier usuario autenticado puede ingresar a `app-web`.
  - En los grupos donde es **`responsable`**: accede a estadísticas del grupo, reporte de participación (`obtener_reporte_grupo`), detalle analítico de jornadas, auditoría Media y exportación del grupo.
  - En los grupos donde es **`participante`** (y en su vista personal *"Mi reporte"*): accede únicamente a sus propios registros, tasas personales, motivos de ajuste/justificación y exportación de su propio reporte.
- **Base de datos en español:** respeta exactamente los nombres de tablas, columnas, códigos `ERR_*` y funciones SQL de `../app-movil/docs/database.md` (en español, `snake_case`, sin tildes ni `ñ`).
- **Zona horaria oficial:** toda fecha, filtro de período y marca de generación de reportes usa **`America/El_Salvador`** (UTC-6).
- **Estados obligatorios en toda vista (`RNF04`):** toda página/sección con datos remotos debe manejar estado `cargando` (skeletons), `vacío`, `error visible con reintento seguro` y sesión expirada sin crashear.
- **Copy de interfaz user-friendly:** los textos visibles para el usuario **no deben incluir** claves internas (`WEB-XX`, `HUxx`, `RFxx`, `RNFxx`, `WEB-SCREEN-XX`), referencias a issues/specs/ADRs, nombres de tablas/campos ni notas como *"mock"* o *"pendiente"*. Usa español claro orientado a la persona.

## 3. Calidad y verificación (sin tests automatizados)
- **NO instales ni escribas tests automatizados** (sin Jest, Vitest ni Playwright; consistente con `../app-movil/docs/adrs/ADR-005-gitflow-issues-y-calidad.md`).
- Antes de proponer cierre de una issue, ejecuta y verifica dentro de `app-web/`:
  - Chequear tipos TypeScript (`typecheck`).
  - Chequear estilo/errores estáticos (`lint`).
  - Verificar compilación de producción (`build`).
- Al terminar tu cambio, entrega al desarrollador humano el **guion de prueba manual E2E en navegador** (desktop y responsive) correspondiente para que valide de punta a punta antes de aprobar el PR.

## 4. Git Flow y cambios a specs
- `main` es la rama de integración. Cada integrante abre su PR pequeño hacia `main` desde una rama de trabajo (`feat/web-XX-...` o `docs/web-...`).
- Si una implementación requiere ajustar una regla de negocio, pantalla o contrato, actualiza `app-web/docs/` **en el mismo PR**.
- Nunca copies los Criterios de Aceptación completos en las issues. Enlaza a `app-web/docs/` (y a `app-movil/docs/database.md` cuando aplique) con URLs absolutas a `main`.

## 5. Leer issues con GitHub CLI (`gh`)
- Antes de empezar una issue, verifica tener `gh` instalado y autenticado (`gh auth login`).
- Comandos útiles para `app-web`:
  ```bash
  gh issue list --label "plataforma:web" --state open
  gh issue list --milestone "Web · Reportería"
  gh issue list --search "[WEB-03]" --state all
  gh issue view <numero>
  gh issue develop <numero> --base main --checkout
  gh pr create --base main
  ```

## 6. Skills de agentes
- **Fuente única:** `app-web/.agents/skills/`. Ahí se agregan o editan las skills del módulo web.
- `.claude/skills/` y `.commandcode/skills/` son **copias** de `.agents/skills/` (sin symlinks, para evitar problemas en Windows). Al cambiar una skill, vuelve a copiarla en el mismo commit:
  ```bash
  rm -rf .claude/skills .commandcode/skills
  cp -r .agents/skills .claude/skills && cp -r .agents/skills .commandcode/skills
  ```
