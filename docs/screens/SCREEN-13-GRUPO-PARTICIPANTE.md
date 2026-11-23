# SCREEN-13 · Grupo, vista participante

- **Wireflow:** `13 Grupo, vista participante`
- **Ruta Expo Router:** `app/grupos/[grupoId]/index.tsx` *(cuando `rol === 'participante'`)*
- **Rol:** Participante activo · **Prioridad:** Alta
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu06`
- **Tablas:** `grupos`, `jornadas`, `asistencias`

## Contenido y acciones
- Encabezado con nombre del grupo, chip `Participante` y configuración resumida (*ej. "Asistencia por QR · con horas"*). *(Sin acceso a Configuración, Integrantes ni Reportes.)*
- Navegación interna de secciones:
  - **Jornadas** *(vista activa)*
  - **Mi historial** → `SCREEN-16` *(filtrado a este grupo)*
- Secciones de jornadas:
  - **Ahora (`En curso`):** tarjeta destacada con horario. Si la jornada tiene `modalidad_asistencia === 'qr'` y no está cancelada, muestra botón principal **Escanear QR** → `SCREEN-14`.
  - **Próximas (`Programada`)** y **Anteriores / Canceladas** (las canceladas marcadas claramente).
  - Tocar una jornada pasada con registro propio → `SCREEN-17` (`Detalle del registro`).

## Estados obligatorios (`RNF04`)
- **Cargando:** spinner inicial + *pull-to-refresh*.
- **Vacío:** *"Aún no hay jornadas publicadas en este grupo."*
- **Error:** mensaje claro con botón **Reintentar**; si fue retirado del grupo, informar que ya no es integrante activo y ofrecer ir a **Mi historial** (`SCREEN-16`).
