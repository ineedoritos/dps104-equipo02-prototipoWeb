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
- Nunca copies los Criterios de Aceptación completos en las issues: usa enlaces relativos (`docs/specs/...#huXX`).
