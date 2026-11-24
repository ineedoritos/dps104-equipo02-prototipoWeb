# Backlog de GitHub Issues (verticales y agent-ready)

Catálogo listo para crear las issues en GitHub (`gh api` o MCP).
> **Regla:** nunca copies los Criterios de Aceptación completos en el cuerpo de una issue; enlaza siempre a `docs/specs/...#huXX`.
> **En GitHub:** usa URLs absolutas a los documentos de `expo-app/docs/` en `main`, por ejemplo `https://github.com/ineedoritos/dps104-equipo02-prototipoWeb/blob/main/expo-app/docs/...#huXX`. Las anclas `#huXX`, `#rpc-...`, `#rls` y `#tablas-alta` existen como `<a id>` en los docs.

---

## 1. Milestones y Labels mínimos (sin Projects V2)

- **Milestones:**
  1. `Fase 2 · UI` (meta: `2026-11-24`) — Setup + pantallas navegables con datos mock tipados.
  2. `MVP · Alta` (meta: `2026-12-01`) — Flujo central completo en Supabase listo para prueba del 2–4 dic.
  3. `MVP · Media` (meta: `2026-12-08`) — GPS puntual, Notificaciones/Push Android y extras antes de la defensa (10-dic).
- **Labels (solo 3 familias):**
  - Tipo: `tipo:setup`, `tipo:historia`, `tipo:bug`
  - Prioridad: `prioridad:alta`, `prioridad:media`
  - Área: `area:ui`, `area:db`, `area:qr`, `area:gps`, `area:push`

---

## 2. Plantilla estándar de Issue (copiar al crear cada issue)

```markdown
## Referencia (Fuente única de verdad — no copiar CA)
- **Spec:** `docs/specs/<archivo>.md#<hu>` (`RFxx` · Criterios: `CA01..CAxx`)
- **Base de datos:** `docs/database.md#<seccion>`
- **Pantalla(s):** `docs/screens/SCREEN-XX.md`
- **ADR aplicable:** `docs/adrs/ADR-00X.md`

## Alcance de esta rebanada vertical
**Incluye:**
- <resumen concreto de 2–4 viñetas>

**Fuera de alcance (no implementar aquí):**
- <qué queda diferido para otra issue o prioridad Media>

## Plan técnico (tareas de implementación)
- [ ] <paso BD / RPC / servicio>
- [ ] <paso UI / estados cargando-vacío-error>
- [ ] <conexión de navegación y validaciones>

## Guía de prueba manual E2E (Human-in-the-loop · Android)
1. **Caso feliz:** <pasos concretos en Android>
2. **Caso borde:** <validación clave de los CA>
3. **Estados RNF04:** probar carga, vacío y error sin red (modo avión + reintentar).

## Definition of Done (DoD)
- [ ] Cumple los CA referenciados sin romper otras HUs.
- [ ] `typecheck` y `lint` pasan sin errores (sin agregar tests automatizados).
- [ ] Sin llaves privadas (`service_role`) en el cliente; autorización en servidor (RNF03).
- [ ] PR pequeño hacia `main` + captura en Android + prueba manual E2E aprobada.
```

---

## 3. Catálogo de 25 Issues Verticales
Las dependencias se expresan por **clave** (no por número de issue); al crearlas en GitHub se enlazan con `blocked by`.

### Milestone 1 · `Fase 2 · UI` (meta 24-nov)

| Clave | Título | Depende de | Docs clave | Alcance y guion E2E rápido |
|---|---|---|---|---|
| `SETUP-01` | `[SETUP-01] Base Expo + Expo Router + NativeWind v4` | — | `05-setup-tecnico.md#setup-01`, `ADR-001`, `ADR-006`, `screens/README.md` | Proyecto Expo TS, navegación pila + pestañas (`Mis grupos`, `Mi historial`, `Notificaciones`, `Cuenta`), NativeWind v4 verificado en pantalla real, instalación de las dependencias de Redux Toolkit y React Redux, helper `lib/fecha.ts` (`America/El_Salvador`), scripts `typecheck` y `lint`. **E2E:** abrir en Android y navegar entre tabs y pantalla interna con estilos aplicados. |
| `UI-01a` | `[UI-01a] UI mock: acceso, grupos, configuración e integrantes` | `SETUP-01` | `SCREEN-01`..`SCREEN-06` | Maquetar con datos mock tipados y estados cargando/vacío/error: login/crear cuenta, Mis grupos, Crear grupo, Grupo responsable, Configuración, Integrantes, pestaña Cuenta. **E2E:** recorrer 01→06 como responsable. |
| `UI-01b` | `[UI-01b] UI mock: jornadas, asistencia, horas, QR y reportes (responsable)` | `SETUP-01` | `SCREEN-07`..`SCREEN-12` | Crear/editar jornada, Detalle, Pasar lista P/A/J, Ajustar horas, Mostrar QR (con selector de caducidad), Reportes. **E2E:** recorrer 07→12 con jornada manual y QR mock. |
| `UI-01c` | `[UI-01c] UI mock: vista participante, escaneo QR e historial` | `SETUP-01` | `SCREEN-13`..`SCREEN-17` | Grupo participante, Escanear QR (permiso cámara), Confirmación, Mi historial, Detalle del registro. **E2E:** recorrer 13→17 como participante. |

### Milestone 2 · `MVP · Alta` (meta 1-dic)

| Clave | Título | Depende de | Docs clave | Alcance y guion E2E rápido |
|---|---|---|---|---|
| `SETUP-02` | `[SETUP-02] Esquema Supabase en español + RLS simplificada + seed demo` | `SETUP-01` | `05-setup-tecnico.md#setup-02`, `ADR-002`, `ADR-006`, `database.md#tablas-alta`, `database.md#rls` | Migración SQL de las 10 tablas, `timezone = America/El_Salvador`, triggers (`usuarios` desde Auth, creador→responsable, horario fijo), RLS simplificada (`es_integrante` / `es_responsable`), seed con las 3 cuentas demo y cliente Supabase en Expo. **E2E:** verificar tablas/RLS en Supabase y conexión desde Android con `anon key`. |
| `HU01` | `[HU01] Registro, inicio y cierre de sesión` | `SETUP-02`, `UI-01a` | `01-acceso-y-grupos.md#hu01`, `SCREEN-01` | Flujo real Auth (nombre, correo único, contraseña mín. 6), errores claros y bloqueo de datos al cerrar sesión. **E2E:** registrar cuenta, duplicar correo, clave mala, entrar bien, cerrar sesión y confirmar redirección. |
| `HU02` | `[HU02] Mis grupos y creación de grupo` | `HU01` | `01-acceso-y-grupos.md#hu02`, `SCREEN-02`, `SCREEN-03` | Listar solo grupos activos del usuario con su rol; crear grupo (nombre + descripción opcional) quedando como responsable. **E2E:** crear grupo, confirmar rol `Responsable` y que otro usuario no lo ve. |
| `HU03` | `[HU03] Gestión de integrantes, roles y protección último responsable` | `HU02` | `01-acceso-y-grupos.md#hu03`, `database.md#rpc-gestionar-integrante`, `SCREEN-06` | RPC `gestionar_integrante` + UI: agregar por correo, cambiar rol (misma fila, sin historial), retirar/salir conservando historial y bloquear quitar al último responsable. **E2E:** correo inexistente (error), agregar Ana, retirarte siendo único responsable (bloqueado). |
| `HU04` | `[HU04] Configuración del grupo (manual/QR y control de horas)` | `HU02` | `01-acceso-y-grupos.md#hu04`, `SCREEN-05` | Elegir `manual`/`qr`, `control_horas` independiente de modalidad, switches Media preparados (GPS solo con QR). **E2E:** guardar config y verificar que solo afecta nuevas jornadas. |
| `HU05` | `[HU05] Crear, editar y cancelar jornadas de un solo día` | `HU04` | `02-jornadas-y-asistencia.md#hu05`, `ADR-003`, `ADR-006`, `SCREEN-07`, `SCREEN-08` | Crear jornada copiando la config del grupo en el `INSERT` (la app la envía), validar `fin > inicio` el mismo día (`America/El_Salvador`); editar (horario fijo si hay asistencias); cancelar excluyendo de totales. **E2E:** `fin <= inicio` o 2 días (error), crear bien, cancelar y confirmar bloqueo de registros. |
| `HU06` | `[HU06] Consultar jornadas y vistas según rol del grupo` | `HU05` | `02-jornadas-y-asistencia.md#hu06`, `ADR-006`, `SCREEN-04`, `SCREEN-08`, `SCREEN-13` | Hubs de responsable y participante con estados derivados (`programada`, `en_curso`, `finalizada`, `cancelada`) y acciones filtradas por rol/config. **E2E:** abrir el mismo grupo con ambos roles y comprobar acciones diferenciadas. |
| `HU07a` | `[HU07a] Registrar asistencia manual (pasar lista)` | `HU03`, `HU06` | `02-jornadas-y-asistencia.md#hu07`, `database.md#rpc-registrar-asistencia-manual`, `SCREEN-09` | RPC `registrar_asistencia_manual` + UI `P / A / J` con motivo obligatorio en `J`, solo participantes activos y sin duplicados. **E2E:** Flujo 3 (P/A/J, J sin motivo → error, dejar uno sin marcar). |
| `HU07b` | `[HU07b] Corrección de asistencia manual y excepción en modo QR` | `HU07a` | `02-jornadas-y-asistencia.md#hu07`, `SCREEN-09` | Actualizar asistencia existente, limpiar horas si cambia a ausencia y acceso excepcional del responsable en jornadas QR. **E2E:** presente con horas → ausente deja horas en 0; corregir registro en grupo QR. |
| `HU08a` | `[HU08a] Generar y regenerar código QR con caducidad elegida` | `HU06` | `02-jornadas-y-asistencia.md#hu08`, `ADR-003`, `SCREEN-11` | Selector de caducidad (5/10/15/30 min, 15 por defecto), token en `codigos_qr` para jornada `en_curso`, temporizador (tope `fin_en`), contador de escaneos y regenerar (revoca el anterior). **E2E:** generar QR de 5 min, regenerarlo y verificar que el anterior queda revocado. |
| `HU08b` | `[HU08b] Escanear QR con cámara (presencia y entrada/salida)` | `HU08a` | `02-jornadas-y-asistencia.md#hu08`, `database.md#rpc-registrar-asistencia-qr`, `SCREEN-14`, `SCREEN-15` | `expo-camera`, RPC `registrar_asistencia_qr` idempotente, presencia o entrada/salida automática y permiso denegado. **E2E:** Flujo 2 (QR vigente, repetir sin duplicar, QR revocado/vencido). |
| `HU09a` | `[HU09a] Registro y validación de entrada/salida y duración` | `HU07a`, `HU08b` | `02-jornadas-y-asistencia.md#hu09`, `SCREEN-10` | Validación servidor de `hora_entrada`/`hora_salida` (sin futuras, dentro de jornada, salida > entrada, sin solapamientos) y ocultar contadores si `control_horas = false`. **E2E:** hora futura, salida < entrada y solapamiento → rechazados. |
| `HU09b` | `[HU09b] Ajuste de tiempo reconocido con motivo obligatorio` | `HU09a` | `02-jornadas-y-asistencia.md#hu09`, `SCREEN-10` | Editar `minutos_reconocidos` (`0..duración`), exigir `motivo_ajuste` si es menor y mostrarlo al participante. **E2E:** Flujo 1 (30 min menos sin motivo → error; con motivo → persiste). |
| `HU14` | `[HU14] Mi historial personal y detalle del registro` | `HU07b`, `HU09b` | `03-historial-y-reportes.md#hu14`, `SCREEN-16`, `SCREEN-17` | Historial propio (incluye ex-grupos), tasas por grupo, totales separados, motivos de ajuste y estado vacío. **E2E:** Flujo 4. |
| `HU15` | `[HU15] Reportes de participación del grupo por período` | `HU07b`, `HU09b` | `03-historial-y-reportes.md#hu15`, `database.md#rpc-obtener-reporte-grupo`, `SCREEN-12` | RPC `obtener_reporte_grupo` + filtros (*7 días, Este mes, Todo, rango*), barra apilada por categoría, tabla de solo lectura, fórmula exacta y desglose de justificadas. **E2E:** Flujos 1 y 3. |

### Milestone 3 · `MVP · Media` (priorizado tras prueba del 2–4 dic)

| Clave | Título | Depende de | Docs clave | Alcance y guion E2E rápido |
|---|---|---|---|---|
| `HU11` | `[HU11] GPS puntual de referencia y comprobación 100 m en QR` | `HU05`, `HU08b` | `04-funciones-media.md#hu11`, `ADR-003`, `SCREEN-07`, `SCREEN-14` | Capturar `ref_latitud/ref_longitud` + validar `precision <= 50 m` y Haversine `<= 100 m` en `registrar_asistencia_qr` (sin mapas). **E2E:** aprobar en sitio, rechazar fuera de radio o sin permiso GPS. |
| `SETUP-03` | `[SETUP-03] Push Android: Firebase FCM v1 + Development Build + Edge Function` | `SETUP-02` | `05-setup-tecnico.md#setup-03`, `ADR-001`, `ADR-004` | Proyecto Firebase Spark (solo FCM v1), credenciales en EAS, Development Build Android, Edge Function `enviar-push` + webhook en `notificaciones`. **E2E:** push de prueba desde expo.dev y desde un INSERT en `notificaciones` llega al teléfono. |
| `HU16` | `[HU16] Notificaciones in-app + Push Android (Dev Build + FCM v1)` | `SETUP-03`, `HU07b`, `HU09b` | `04-funciones-media.md#hu16`, `ADR-004`, `SCREEN-18` | Registro de `tokens_push` por usuario, bandeja `notificaciones` (leída/no leída, `clave_unica`) y generación de eventos (la infraestructura push viene de `SETUP-03`) para `asistencia_modificada` y `horas_actualizadas`. *(El evento `solicitud_revision` se conecta en `HU13`.)* **E2E:** con permiso push (Android + bandeja) y sin permiso (solo bandeja). |
| `HU13` | `[HU13] Solicitudes de revisión de asistencia` | `HU14`, `HU16` | `04-funciones-media.md#hu13`, `SCREEN-17` | Solicitar revisión con motivo (máx. 1 pendiente por jornada), resolver con motivo, corregir por `HU07`/`HU09` y emitir notificación `solicitud_revision` a responsables. **E2E:** crear solicitud, duplicar pendiente (bloqueado), resolver y ver estado. |
| `HU10` | `[HU10] Evidencia fotográfica opcional por jornada` | `HU05` | `04-funciones-media.md#hu10`, `SCREEN-08` | Captura/subida opcional a Storage, galería con autor/fecha y retiro por responsable. **E2E:** subir y retirar foto sin borrar asistencia; permiso de cámara denegado no bloquea. |
| `HU12` | `[HU12] Validación previa de participación` | `HU07b`, `HU09b` | `04-funciones-media.md#hu12`, `SCREEN-09` | Aprobar / volver a `pendiente` al editar, sin auto-aprobación y sin aprobar horas incompletas. **E2E:** aprobar registro y comprobar vuelta a pendiente al editarlo. |
