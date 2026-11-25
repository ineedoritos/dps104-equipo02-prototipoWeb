# WEB-SCREEN-06 · Auditoría y seguimiento Media (`/auditoria`)

- **Spec:** `docs/specs/02-dashboard-y-reportes.md#web-07`
- **RF / RNF:** `RF10`, `RF12`, `RF13`, `RF-WEB-08`, `RNF03`, `RNF05`
- **Actor:** Responsable del grupo seleccionado · **Prioridad:** Media

## Objetivo
Ofrecer una vista consolidada de solo lectura para monitorear registros con validación pendiente, solicitudes de revisión y evidencias fotográficas activas.

## Elementos de UI
Navegación por pestañas (`Tabs` de shadcn/ui):
1. **Validaciones pendientes (`RF12`):** tabla de asistencias con `estado_validacion = 'pendiente'`, filtrable por jornada.
2. **Solicitudes de revisión (`RF13`):** tabla filtrable por estado (`Pendiente`, `Resuelta`, `Rechazada`) mostrando participante, jornada, `motivo_solicitud`, `motivo_resolucion` y fecha.
3. **Evidencias fotográficas (`RF10`):** galería en grilla con fotos activas (`retirada_en IS NULL`), autor, jornada y fecha de captura, con modal de vista ampliada.

## Estados obligatorios (`RNF04`)
- **Cargando:** skeletons por pestaña.
- **Vacío:** mensaje informativo cuando no hay pendientes, solicitudes o fotos (o si la función está desactivada en el grupo).
- **Error:** alerta con reintento seguro sin exponer rutas internas de Storage.
