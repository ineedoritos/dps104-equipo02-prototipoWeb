# Spec 04 · Funciones opcionales (Prioridad Media)

Módulo de prioridad **Media** (`RF10`–`RF13`, `RF16`).
> **Regla de implementación:** se construyen **después** de tener el `MVP · Alta` estable (corte 1-dic). Sus tablas y columnas ya están contempladas en `docs/database.md` desde el inicio para evitar migraciones destructivas. Orden sugerido tras la prueba del 2–4 dic: **1) `HU11` (GPS)**, **2) `HU16` (Notificaciones + Push Android)**, **3) `HU13` (Revisiones)**, **4) `HU10` (Fotos)**, **5) `HU12` (Validación)**.

---

<a id="hu10"></a>

## HU10 · Documentar jornadas con fotografías
- **Requerimiento:** `RF10` (Evidencia fotográfica) · **Actor:** Integrante · **Prioridad:** Media
- **Criterios de aceptación:**
  - `CA01`: Si `modo_fotos` es `'opcionales'` u `'obligatorias'` en la jornada, cualquier integrante autorizado puede capturar una foto con la cámara y asociarla a una jornada iniciada y no cancelada (guardada en Supabase Storage). Si es `'no_permitidas'`, no se permite subir fotos.
  - `CA02`: Cada foto muestra autor y fecha; solo los integrantes autorizados del grupo la consultan.
  - `CA03`: Si `modo_fotos = 'opcionales'`, permiso de cámara denegado o error de subida no bloquea el registro de asistencia y permite reintentar. Si `modo_fotos = 'obligatorias'`, el participante debe adjuntar al menos una foto para completar/validar su asistencia; si niega el permiso de cámara o falla la subida, se muestra mensaje claro con opción de abrir ajustes del sistema o reintentar, y el responsable conserva la facultad de registrar o corregir la asistencia manualmente (`HU07 CA05`).
  - `CA04`: El responsable puede retirar una foto no autorizada (`retirada_en`, `retirada_por`) sin afectar ni borrar asistencias.

---

<a id="hu11"></a>

## HU11 · Registrar y comprobar ubicación (GPS puntual)
- **Requerimiento:** `RF11` (Geolocalización) · **Actor:** Responsable (referencia) y Participante (escaneo QR) · **Prioridad:** Media *(prioridad #1 dentro de Media)*
- **Criterios de aceptación:**
  - `CA01`: Al crear o iniciar la jornada con `gps_habilitado = true`, el responsable captura una ubicación puntual de referencia (`ref_latitud`, `ref_longitud`, `ref_ubicacion_en`).
  - `CA02`: Al escanear QR con `gps_habilitado = true`, el cliente envía su ubicación puntual actual (`lat`, `lng`, `precision_metros`). **El servidor** (`registrar_asistencia_qr`) exige `precision_metros <= 50` y distancia Haversine `<= 100` metros respecto a la referencia de la jornada.
  - `CA03`: Si está fuera del radio, sin permiso de GPS o con precisión mayor a 50 m, no se confirma el registro QR; se muestra mensaje claro y el responsable puede registrar manualmente (`HU07 CA05`).
  - `CA04`: **No se muestran mapas interactivos** ni se guarda ubicación fuera del momento puntual de fijar la referencia o escanear el QR.

---

<a id="hu12"></a>

## HU12 · Validar participación
- **Requerimiento:** `RF12` (Validación) · **Actor:** Responsable · **Prioridad:** Media
- **Criterios de aceptación:**
  - `CA01`: Si `requiere_validacion = true` en la jornada, todo registro nuevo inicia en `estado_validacion = 'pendiente'`. Las horas incompletas (entrada sin salida) no se pueden aprobar.
  - `CA02`: El responsable aprueba registros de participantes de su grupo; si la jornada no exige validación, la UI lo indica explícitamente.
  - `CA03`: Al modificar un registro previamente aprobado, regresa automáticamente a `pendiente` y sus horas salen del total aprobado hasta nueva aprobación.
  - `CA04`: Solo responsables autorizados aprueban, **nunca sus propios registros** (`validado_por <> participante_id`); las jornadas canceladas no cuentan.

---

<a id="hu13"></a>

## HU13 · Solicitar revisión
- **Requerimiento:** `RF13` (Solicitudes de revisión) · **Actor:** Participante y Responsable · **Prioridad:** Media
- **Criterios de aceptación:**
  - `CA01`: Un participante activo puede solicitar revisión sobre una jornada no cancelada de su grupo (incluso si no tiene registro), con `motivo_solicitud` obligatorio (solo texto, sin adjuntos).
  - `CA02`: Solo existe **una solicitud `pendiente`** por `(jornada_id, participante_id)` (índice único parcial en BD). Crear la solicitud **no modifica** la asistencia ni las horas.
  - `CA03`: El responsable resuelve (`resuelta` o `rechazada`) con `motivo_resolucion` obligatorio y, si procede, corrige la asistencia mediante `HU07`/`HU09`.
  - `CA04`: El participante consulta en el detalle del registro el estado y la resolución de su solicitud.

---

<a id="hu16"></a>

## HU16 · Recibir notificaciones (In-App + Push Android)
- **Requerimiento:** `RF16` (Notificaciones) · **Actor:** Usuario · **Prioridad:** Media *(prioridad #2 dentro de Media)*
- **Criterios de aceptación:**
  - `CA01`: El participante recibe notificación cuando: (a) se modifica su asistencia, o (b) se aprueban o modifican sus horas.
  - `CA02`: El responsable recibe notificación cuando se crea una solicitud de revisión (`HU13`).
  - `CA03`: La bandeja in-app muestra únicamente las notificaciones propias con fecha y estado `leida` / `no leida`.
  - `CA04`: Si el usuario concedió permiso en Android (Development Build + FCM v1), además recibe notificación push; si lo negó, la ve en la bandeja in-app. **Prohibido** enviar notificaciones por cada llegada QR, SMS o correo. Los reintentos **no duplican** notificaciones (`clave_unica` en BD).
