# Spec Web 00 · Visión general, alcance y matriz RF/RNF

Módulo web complementario del proyecto **Registro de actividades** (UDB · DPS104 · Equipo 02 · Ciclo 03-2026).
Base académica y contrato de datos compartidos: `../app-movil/docs/specs/00-general.md` y `../app-movil/docs/database.md`.

---

## 1. Propósito de `app-web`
Ofrecer una interfaz web cómoda en pantalla grande para **consultar estadísticas, reportes de participación, detalle de jornadas e historial personal**, y permitir la **exportación 100% client-side a PDF y Excel** sin introducir ningún backend adicional.

- **Mismo proyecto Supabase:** comparte Auth, tablas en español, políticas RLS y el RPC `obtener_reporte_grupo` definidos en `../app-movil/docs/database.md`.
- **Acceso abierto por rol de grupo:** cualquier usuario autenticado puede iniciar sesión en `app-web`.
  - Si es **`responsable`** en uno o más grupos: accede al dashboard grupal, reportes de participación de sus grupos, consulta analítica de jornadas, exportación PDF/Excel grupal y auditoría Media.
  - Si es **`participante`** en uno o más grupos (o ex-integrante con historial): accede a **su propio reporte personal** (asistencias, tasas por grupo, horas registradas vs reconocidas, motivos de ajuste/justificación y exportación PDF/Excel de su propio historial).
  - Un mismo usuario puede cambiar libremente entre sus grupos según el rol que tenga en cada uno.

---

## 2. Alcance de `app-web` (Dentro vs No-Goals)

| Dentro de `app-web` | Fuera de `app-web` (No-Goals — PROHIBIDO implementar) |
|---|---|
| Inicio y cierre de sesión con la misma cuenta Supabase (`RF01`). | Registro/gestión de cuentas administrativas globales o jerarquías nuevas. |
| Dashboard de estadísticas y KPIs por grupo (responsable) y personales (participante). | Crear/editar/cancelar jornadas, pasar lista manual, generar o escanear QR (exclusivo de `app-movil`). |
| Reportes de participación por período con fórmula exacta de `RF15` y desglose de justificadas. | Backend propio (Express, NestJS, API Routes con lógica de negocio o `service_role`). |
| Consulta solo lectura de jornadas, detalle de asistencias, motivos de ajuste y auditoría Media. | Edición directa de asistencias, horas o resolución de solicitudes desde la web. |
| Exportación **100% client-side** a PDF (`jspdf` + `jspdf-autotable`) y Excel (`xlsx-style` / `xlsx-js-style`). | Envío de datos a servicios externos de renderizado PDF/Excel o exportación en servidor. |
| Interfaz responsive (desktop prioritario + tablet/móvil legible) con Next.js + Tailwind + shadcn/ui. | Modo offline-first, notificaciones push web, mapas interactivos o chat. |

> **Nota legal/académica:** Al igual que en `app-movil`, las horas reconocidas mostradas y exportadas son internas del grupo y **no sustituyen la acreditación oficial de servicio social**. Toda exportación PDF/Excel debe incluir esta nota al pie.

---

## 3. Matriz de Requerimientos Funcionales (RF)

| Clave Web | Relación con T1 / Móvil | Actor | Descripción |
|---|---|---|---|
| `RF-WEB-01` | Extiende `RF01`, `RF02` | Responsable / Participante | Iniciar y cerrar sesión con Supabase Auth, listar grupos activos del usuario indicando su rol en cada grupo y adaptar navegación según el rol del grupo seleccionado. |
| `RF-WEB-02` | Extiende `RF15`, `RF06` | Responsable | Dashboard de estadísticas del grupo por período (*7 días, Este mes, Todo, rango*): KPIs principales, distribución de asistencia (barra apilada) y tendencia por jornada. |
| `RF-WEB-03` | Extiende `RF15` | Responsable | Tabla de reporte de participación por integrante usando `obtener_reporte_grupo`, búsqueda/ordenamiento, desglose de ausencias justificadas y motivos de ajuste de horas. |
| `RF-WEB-04` | Extiende `RF14`, `RF15` | Participante / Cualquier usuario | Vista **"Mi reporte personal"**: resumen de tasas por grupo (incluyendo ex-grupos), tabla filtrable de registros propios, horas registradas vs reconocidas y motivos visibles. |
| `RF-WEB-05` | Extiende `RF06`, `RF14` | Responsable | Consulta analítica (solo lectura) de jornadas del grupo, su estado derivado, etiqueta de canceladas y detalle de asistencias/horas registradas en cada jornada. |
| `RF-WEB-06` | Nuevo (complemento `RF14`/`RF15`) | Responsable / Participante | Exportación **client-side** a **PDF** del reporte actualmente filtrado (grupal para responsables; personal para participantes). |
| `RF-WEB-07` | Nuevo (complemento `RF14`/`RF15`) | Responsable / Participante | Exportación **client-side** a **Excel (`.xlsx`)** con estilos y hojas separadas del reporte filtrado (grupal o personal). |
| `RF-WEB-08` | Extiende `RF10`, `RF12`, `RF13` *(Media)* | Responsable | Panel de auditoría solo lectura para consultar validaciones pendientes, solicitudes de revisión y galería de evidencias fotográficas activas del grupo. |

---

## 4. Matriz de Requerimientos No Funcionales (RNF)

| Clave | Origen | Definición aplicable a `app-web` |
|---|---|---|
| `RNF02` | T1 (compartido) | **Persistencia en la nube:** toda lectura se realiza contra la API de Supabase; sin bases de datos locales ni mocks en producción. |
| `RNF03` | T1 (compartido) | **Seguridad e integridad:** autorización 100% en servidor mediante **RLS** y **RPCs** de Supabase. Jamás exponer `service_role` ni credenciales privadas en cliente o repositorio. |
| `RNF04` | T1 (compartido) | **Estados de UI y resiliencia:** toda vista con datos remotos maneja estado `cargando` (skeleton), `vacío` (mensaje claro), `error visible con reintento seguro` y expiración de sesión. |
| `RNF05` | T1 (compartido) | **Privacidad:** solo se muestran datos y fotografías autorizados por RLS (`retirada_en IS NULL` para evidencias). No exportar correos ni datos ajenos fuera del alcance del rol. |
| `RNF-WEB-01` | Web | **Stack y usabilidad web:** Next.js (App Router, TypeScript), Tailwind CSS y shadcn/ui; diseño desktop-first responsive y accesible con teclado. |
| `RNF-WEB-02` | Web | **Exportación 100% Client-Side:** los archivos PDF y Excel se generan íntegramente en la memoria del navegador sin backend propio ni transmisión de datos a terceros. |
| `RNF-WEB-03` | Web / `ADR-006` | **Consistencia temporal:** todos los cálculos de rangos de fechas, estados derivados de jornadas y sellos de exportación usan `America/El_Salvador` (UTC-6). |
