# SCREEN-10 · Ajustar horas

- **Wireflow:** `10 Ajustar horas`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/ajustar-horas.tsx` *(recibe `?participanteId=...`)*
- **Rol:** Responsable activo · **Prioridad:** Alta
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu09`
- **Tablas / RPC:** `asistencias`, RPC `registrar_asistencia_manual`

## Contenido y acciones
- Encabezado: *"Ajustar horas de [Nombre]"* + título y horario de la jornada.
- Disponible **solo si `jornada.control_horas === true`** y el participante está `presente`.
- Campos:
  - `Hora de entrada` (editable en modo manual o ajuste excepcional; indica si vino por QR).
  - `Hora de salida` (debe ser posterior a entrada, no futura y dentro del intervalo de la jornada).
  - Indicador calculado en vivo: **`Duración calculada`** (*ej. "3 h 58 min"*).
  - `Tiempo reconocido` (valor entre `0` y `duracion_minutos`).
  - **`Motivo del ajuste`** (obligatorio únicamente si `minutos_reconocidos < duracion_minutos`).
- Nota informativa: *"[Nombre] verá este motivo en su historial. Así evitamos reclamos semanas después."*
- Botón principal: **Guardar horas** → valida en servidor (`registrar_asistencia_manual`) y regresa a `SCREEN-09`.

## Estados obligatorios (`RNF04`)
- **Validación cliente + servidor:** rechazar horas futuras (`ERR_HORA_INVALIDA`), fuera del intervalo de la jornada, `salida <= entrada`, solapamiento con otra jornada (`ERR_SOLAPAMIENTO_HORAS`) o ajuste menor sin motivo (`ERR_MOTIVO_OBLIGATORIO`).
- **Cargando / Error:** deshabilitar botón al guardar y mostrar error claro con reintento.
