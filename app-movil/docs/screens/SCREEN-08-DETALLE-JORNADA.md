# SCREEN-08 · Detalle de jornada

- **Wireflow:** `08 Detalle de actividad`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/index.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta *(Fotos es Media · `HU10`)*
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu05` y `#hu06`
- **Tablas:** `jornadas`, `asistencias`, `integrantes_grupo` *(+ `fotos_jornada` en Media)*

## Contenido y acciones
- Encabezado: estado badge (`En curso`, `Programada`, `Finalizada` o `Cancelada`), título, descripción y horario (`fecha · inicio – fin`).
- Tarjetas de resumen rápido: `X presentes` · `Y ausentes/justificadas` · `Z sin registrar` (sobre participantes activos del grupo).
- **Acciones habilitadas según modalidad y estado** (`HU06 CA03`):
  - Si `modalidad_asistencia === 'qr'` y jornada `en_curso` y no cancelada:
    - Botón principal: **Mostrar QR** → `SCREEN-11`.
    - Botón secundario: **Ver asistencia y corregir** → `SCREEN-09` (`HU07 CA05`).
  - Si `modalidad_asistencia === 'manual'` y jornada iniciada (`en_curso` o `finalizada`) y no cancelada:
    - Botón principal: **Pasar lista** → `SCREEN-09`.
  - Botón **Editar jornada** → `SCREEN-07` *(si no está cancelada)*.
  - Botón destructivo **Cancelar jornada** (con modal de confirmación) → marca `cancelada = true`, conserva registros excluyéndolos de totales y bloquea nuevos registros.
- **[Media · `HU10`]** Bloque **Fotos de la jornada** (solo si `modo_fotos !== 'no_permitidas'`): galería con autor/fecha, botón `+` (cámara) y opción del responsable de retirar foto.

## Estados obligatorios (`RNF04`)
- **Cargando:** skeleton del detalle + resumen.
- **Jornada cancelada:** banner destacado *"Jornada cancelada: sus registros no cuentan en los totales"* y botones de registro deshabilitados.
- **Error:** aviso visible con reintento seguro.
