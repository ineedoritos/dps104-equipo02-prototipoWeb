# Spec 02 · Jornadas, asistencia manual, QR y control de horas

Módulo central de prioridad **Alta** (`RF05`–`RF09`).
> En el T1 estas sesiones se llaman *"actividades"*; en BD y código se llaman **`jornadas`** para evitar confusión con tareas/entregables.

---

<a id="hu05"></a>

## HU05 · Gestionar jornadas
- **Requerimiento:** `RF05` (Gestión de actividades/jornadas) · **Actor:** Responsable · **Prioridad:** Alta
- **Historia:** Como responsable, quiero crear y gestionar jornadas para conservar un registro organizado.
- **Criterios de aceptación:**
  - `CA01`: Se exigen **título**, **descripción**, **inicio** (`inicio_en`) y **fin** (`fin_en`). Debe cumplirse `fin_en > inicio_en` y que ambos ocurran dentro de una **única jornada del mismo día calendario** (`America/El_Salvador`, UTC-6).
  - `CA02`: Al crearse, la jornada guarda una **copia (snapshot)** de la configuración vigente del grupo (`modalidad_asistencia`, `control_horas`, `gps_habilitado`, `modo_fotos`, `requiere_validacion`, `notificaciones_habilitadas`) y queda visible para los integrantes activos.
  - `CA03`: La jornada puede editarse; si ya existen registros en `asistencias` o `fotos_jornada`, el horario (`inicio_en` y `fin_en`) **queda fijo** (solo se permite editar título/descripción).
  - `CA04`: La jornada puede cancelarse (`cancelada = true`) conservando registros y fotos existentes, pero **excluyéndolos de todos los totales y reportes**, y bloqueando nuevos registros o escaneos QR.

---

<a id="hu06"></a>

## HU06 · Consultar jornadas
- **Requerimiento:** `RF06` (Consulta de actividades/jornadas) · **Actor:** Integrante · **Prioridad:** Alta
- **Historia:** Como integrante, quiero consultar las jornadas del grupo para conocer su programación y detalles.
- **Criterios de aceptación:**
  - `CA01`: El estado mostrado se deriva de `cancelada`, `inicio_en`, `fin_en` y la hora actual (`America/El_Salvador`, ver `ADR-006`): **`cancelada`** (si `cancelada = true`), **`programada`** (antes de `inicio_en`), **`en_curso`** (entre `inicio_en` y `fin_en`) o **`finalizada`** (después de `fin_en`).
  - `CA02`: Solo se consultan jornadas de grupos autorizados; las canceladas se identifican como tales.
  - `CA03`: La pantalla de detalle muestra únicamente las acciones habilitadas para el rol del usuario en el grupo y la configuración copiada en esa jornada.

---

<a id="hu07"></a>

## HU07 · Registrar asistencia manual
- **Requerimiento:** `RF07` (Asistencia manual) · **Actor:** Responsable · **Prioridad:** Alta
- **Historia:** Como responsable, quiero registrar y corregir la asistencia para conocer quiénes participaron realmente.
- **Criterios de aceptación:**
  - `CA01`: Solo se puede registrar asistencia para integrantes **activos** (`retirado_en IS NULL`) cuyo **rol actual** en el grupo es **`participante`** en una jornada **iniciada** (`now() >= inicio_en`) y **no cancelada**. Los responsables no generan asistencias propias. *(Simplificación MVP: no se guarda historial de roles; cambiar el rol no altera asistencias ya registradas.)*
  - `CA02`: Los estados válidos son **`presente`**, **`ausente`** o **`justificada`** (exige texto breve `motivo_ausencia`; es informativo y no recibe adjuntos). Un participante sin fila en `asistencias` **no cuenta como ausente**.
  - `CA03`: Existe un **único registro por `(jornada_id, participante_id)`**; toda corrección actualiza esa misma fila (sin duplicados).
  - `CA04`: Si un registro cambia a `ausente` o `justificada`, deja de generar horas (`hora_entrada`, `hora_salida`, `duracion_minutos` y `minutos_reconocidos` se limpian/anulan). Si la jornada exigía validación *(Media)* y estaba aprobado, vuelve a `pendiente`.
  - `CA05`: En jornadas configuradas en modo **`qr`**, el responsable mantiene acceso a esta pantalla para registrar o corregir asistencias de forma excepcional.

---

<a id="hu08"></a>

## HU08 · Registrar asistencia con QR
- **Requerimiento:** `RF08` (Asistencia por QR) · **Actor:** Participante (escaneo) y Responsable (generación) · **Prioridad:** Alta
- **Historia:** Como participante, quiero escanear el QR de una jornada para registrar mi presencia sin depender de una lista manual.
- **Criterios de aceptación:**
  - `CA01`: El responsable genera un QR para una jornada **`en_curso`** y no cancelada. Al generarlo, el responsable **elige el tiempo de caducidad** (`5`, `10`, `15` o `30` min; `15` por defecto). El código vence al cumplirse ese tiempo o al finalizar/cancelar la jornada (lo que ocurra primero). Puede regenerarse en cualquier momento (revocando el código anterior).
  - `CA02`: Al escanear, **el servidor** (`registrar_asistencia_qr`) verifica: cuenta autenticada, integrante activo con rol actual `participante`, vigencia/no revocación del QR y que la jornada tenga `modalidad_asistencia = 'qr'`.
  - `CA03`: Si `control_horas = false`, el escaneo registra directamente `estado = 'presente'`. Si `control_horas = true`, el flujo detecta automáticamente si corresponde marcar **`entrada`** (sin entrada previa) o **`salida`** (ya tiene entrada y aún no tiene salida), muestra confirmación clara y aplica las reglas de `HU09`.
  - `CA04`: Repetir una marca ya registrada o escanear un código inválido/expirado/revocado **no crea registros duplicados** e informa claramente el resultado.
  - `CA05`: Si `gps_habilitado = true` *(Media · `HU11`)*, debe cumplirse la comprobación de cercanía GPS antes de confirmar el registro. En `MVP · Alta`, `gps_habilitado` es `false` por defecto.

---

<a id="hu09"></a>

## HU09 · Contabilizar horas
- **Requerimiento:** `RF09` (Control de horas) · **Actor:** Responsable (y Participante en marcas QR) · **Prioridad:** Alta
- **Historia:** Como responsable, quiero registrar y reconocer el tiempo de participación para evitar discrepancias de horas.
- **Criterios de aceptación:**
  - `CA01`: Con `control_horas = true`, cada asistencia `presente` admite **una entrada** (`hora_entrada`) y **una salida** (`hora_salida`). En modo manual las registra/edita el responsable; en modo QR las marca el participante (y el responsable puede ajustarlas).
  - `CA02`: Se guardan fechas y horas completas (`timestamptz`). El servidor rechaza: marcas en el futuro (`> now()`), marcas fuera del intervalo `[inicio_en, fin_en]` de la jornada, salidas no posteriores a la entrada (`hora_salida <= hora_entrada`) y solapamientos con otra asistencia con horas del mismo participante.
  - `CA03`: Las ausencias (`ausente` / `justificada`) no generan horas. Con entrada y salida completas, `duracion_minutos` se calcula automáticamente; `minutos_reconocidos` debe cumplir `0 <= minutos_reconocidos <= duracion_minutos` y, si es menor que `duracion_minutos`, se exige un **`motivo_ajuste` obligatorio** visible para el participante.
  - `CA04`: Si la jornada exige validación *(Media · `HU12`)*, las horas solo suman al total aprobado tras aprobar; cuando `requiere_validacion = false` (por defecto en `MVP · Alta`), quedan aprobadas al completarse el registro.
  - `CA05`: Con `control_horas = false`, no se admiten marcas de entrada/salida ni se muestra contador de horas en la interfaz.
