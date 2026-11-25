# Mapa de pantallas de `app-web`

Rutas App Router del portal web de reportería y estadísticas.

| Código | Ruta | Actor principal | Descripción |
|---|---|---|---|
| [WEB-SCREEN-01](./WEB-SCREEN-01-LOGIN.md) | `/login` | Todos | Inicio de sesión con cuenta Supabase Auth. |
| [WEB-SCREEN-02](./WEB-SCREEN-02-DASHBOARD.md) | `/dashboard` | Responsable | KPIs del grupo seleccionado, barra apilada y tendencia por período. |
| [WEB-SCREEN-03](./WEB-SCREEN-03-REPORTES-PARTICIPACION.md) | `/reportes` | Responsable | Tabla de participación por integrante (`obtener_reporte_grupo`), motivos y exportación PDF/Excel. |
| [WEB-SCREEN-04](./WEB-SCREEN-04-DETALLE-JORNADAS.md) | `/jornadas` y `/jornadas/[id]` | Responsable | Listado analítico de jornadas y detalle de asistencias/horas en solo lectura. |
| [WEB-SCREEN-05](./WEB-SCREEN-05-MI-REPORTE-PERSONAL.md) | `/mi-reporte` | Participante / Todos | Estadísticas personales, historial por grupo (incluye ex-grupos), motivos y exportación PDF/Excel propia. |
| [WEB-SCREEN-06](./WEB-SCREEN-06-AUDITORIA-Y-REVISIONES.md) | `/auditoria` | Responsable *(Media)* | Consulta solo lectura de validaciones pendientes, solicitudes de revisión y galería de evidencias. |

## Regla de navegación por rol de grupo
- En el header/sidebar existe un **Selector de contexto**:
  - Lista de grupos activos del usuario con badge `Responsable` o `Participante`.
  - Acceso directo fijo a **`Mi reporte personal`** (`/mi-reporte`), siempre visible para cualquier usuario autenticado.
- Si el grupo activo tiene rol `Responsable`, el menú muestra: *Dashboard*, *Reportes*, *Jornadas*, *Auditoría (Media)* y *Mi reporte personal*.
- Si el grupo activo tiene rol `Participante` (o el usuario no administra ningún grupo), redirige/enfoca en *Mi reporte personal* (con filtro preseleccionado en ese grupo si aplica).
