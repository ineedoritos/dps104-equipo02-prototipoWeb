# SCREEN-07 · Crear o editar jornada

- **Wireflow:** `07 Crear actividad`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/crear.tsx` *(reutilizable para edición pasando `?jornadaId=...`)*
- **Rol:** Responsable activo · **Prioridad:** Alta *(GPS puntual de referencia es Media · `HU11`)*
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu05` · `docs/specs/04-funciones-media.md#hu11`
- **Tablas:** `jornadas`

## Contenido y acciones
- Título: *"Nueva jornada"* (o *"Editar jornada"*).
- Campos obligatorios:
  - `Título`
  - `Descripción`
  - `Fecha` (un solo día en `America/El_Salvador`) + `Hora de inicio` + `Hora de fin` (`fin_en > inicio_en` mismo día).
  - *(En modo edición: si ya existen asistencias o fotos, los campos de fecha/hora aparecen bloqueados con aviso: "Ya hay registros; el horario quedó fijo".)*
- Tarjeta informativa de solo lectura: *"Usa la configuración actual del grupo"* (ej. `Asistencia por QR · con control de horas`).
- **[Media · `HU11`]** Si `gps_habilitado = true`: bloque **Ubicación de la jornada** con botón **Capturar ubicación actual** (simulado en desarrollo con `HojaAcciones`) que guarda `ref_latitud`, `ref_longitud` y `ref_ubicacion_en` mostrando precisión y hora (sin mapa ni coordenadas en crudo). No permite guardar la jornada sin ubicación fijada.
- Botón principal: **Crear jornada** (o **Guardar cambios**) → navega a `SCREEN-08`.

## Estados obligatorios (`RNF04`)
- **Validación cliente + servidor:** título/descripción no vacíos, `fin_en > inicio_en`, mismo día calendario.
- **Permiso GPS (Media):** si se deniega permiso de ubicación, mostrar mensaje claro con opción de reintentar sin bloquear pantallas donde GPS esté apagado.
- **Cargando / Error:** deshabilitar botón al enviar; mostrar error claro (`ERR_HORARIO_BLOQUEADO`, red) con reintento.
