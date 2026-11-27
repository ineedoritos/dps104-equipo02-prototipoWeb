# SCREEN-14 · Escanear QR

- **Wireflow:** `14 Escanear QR`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/escanear-qr.tsx`
- **Rol:** Participante activo · **Prioridad:** Alta *(validación GPS puntual es Media · `HU11`)*
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu08` · `docs/specs/04-funciones-media.md#hu11`
- **Hardware / RPC:** `expo-camera` *(+ `expo-location` en Media)* → RPC `registrar_asistencia_qr`

## Contenido y acciones
- Visor de cámara (`expo-camera`) con marco de escaneo QR.
- Texto guía: *"Apunta al código del responsable"*.
  - Si `control_horas === true`: *"La app detecta automáticamente si registras tu entrada o tu salida."*
- Al leer un QR:
  1. Bloquea lecturas duplicadas mientras procesa.
  2. **[Media · `HU11`]** Si `jornada.gps_habilitado === true`, muestra *"Comprobando tu ubicación…"* y toma ubicación puntual (simulada en desarrollo mediante `HojaAcciones` con 4 casos: dentro del radio, fuera de radio, poca precisión y sin permiso; sin mapa).
  3. Llama a `registrar_asistencia_qr(...)` validando precisión `<= 50 m` y distancia Haversine `<= 100 m` respecto a `(ref_latitud, ref_longitud)`.
  4. Si responde éxito → navega a `SCREEN-15` (`Entrada/Salida registrada`).
- Nota al pie: *"Sin permiso de cámara o fuera de rango: el responsable puede registrarte manualmente."*

## Estados obligatorios (`RNF04`)
- **Permiso de cámara denegado:** pantalla limpia explicando cómo habilitarlo + botón para volver a solicitar permiso y recordatorio de registro manual por el responsable.
- **Permiso GPS denegado / fuera de radio / poca precisión (Media):** tarjeta de error clara (`ERR_GPS_SIN_PRECISION`, `ERR_GPS_FUERA_DE_RADIO` o permiso denegado) con botón **Reintentar** y aviso de registro manual por el responsable.
- **QR inválido, vencido, revocado o marca repetida:** feedback inmediato en pantalla sin crear duplicados y botón para volver a escanear.
