# SCREEN-15 · Entrada / Presencia registrada

- **Wireflow:** `15 Entrada registrada`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/confirmacion-qr.tsx`
- **Rol:** Participante activo · **Prioridad:** Alta
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu08` y `#hu09`

## Contenido y acciones
- Confirmación visual inmediata según lo devuelto por `registrar_asistencia_qr`:
  - **Sin control de horas:** *"Presencia registrada"* + hora exacta + nombre de jornada y grupo.
  - **Con control de horas (1er escaneo — Entrada):** *"Entrada registrada · HH:MM"* + aviso *"Al irte, escanea otra vez para registrar tu salida y calcular tus horas"*.
  - **Con control de horas (2do escaneo — Salida):** *"Salida registrada · HH:MM"* + duración calculada (*ej. "3 h 05 min registradas"*).
  - **Marca repetida / ya completa:** mensaje informativo neutro (*"Tu registro para esta jornada ya estaba completo"*) sin alarma ni duplicado.
- Botón principal: **Ver mi registro** → `SCREEN-17`.
- Botón secundario: **Volver al grupo** → `SCREEN-13`.

## Estados obligatorios (`RNF04`)
- Pantalla puramente de confirmación basada en la respuesta confirmada por servidor (`RNF02`). Si el usuario abre la ruta sin parámetros válidos, redirige seguro a `SCREEN-16`.
