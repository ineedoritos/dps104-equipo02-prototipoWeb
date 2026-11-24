# SCREEN-11 · Mostrar QR

- **Wireflow:** `11 Mostrar QR`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/mostrar-qr.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu08`
- **Tablas:** `codigos_qr`, `asistencias`, `jornadas`

## Contenido y acciones
- Encabezado: *"Código de asistencia"* + nombre de la jornada (`En curso`).
- Antes de generar: selector **Caducidad del código** (`5` · `10` · `15` · `30` min; `15` por defecto). El código nunca dura más allá de `fin_en`.
- Código QR grande y nítido en pantalla con el token vigente de `codigos_qr`.
- Temporizador regresivo visible según la caducidad elegida (*ej. "14:32 para que venza · también vence al terminar la jornada"*).
- Texto guía:
  - Si `control_horas === true`: *"Pide a cada participante que lo escanee al llegar y al irse."*
  - Si `control_horas === false`: *"Pide a cada participante que lo escanee para registrar su presencia."*
- Contador en tiempo real / refrescable: *"Han escaneado X de Y participantes"*.
- Botón secundario: **Regenerar código** → revoca el token anterior (`revocado_en = now()`) y genera uno nuevo con la caducidad elegida (o hasta `fin_en`).

## Estados obligatorios (`RNF04`)
- **Cargando:** spinner mientras se genera el token en Supabase.
- **Vencido:** cuando el reloj llega a `00:00`, ocultar o atenuar el QR e invitar a pulsar **Regenerar código**. Si la jornada finalizó o se canceló, deshabilitar regeneración.
- **Error:** aviso visible con reintento si falla la generación o carga.
