# Spec 01 · Acceso, grupos, integrantes y configuración

Módulo de prioridad **Alta** (`RF01`–`RF04`).

---

<a id="hu01"></a>

## HU01 · Acceder a mi cuenta
- **Requerimiento:** `RF01` (Autenticación) · **Actor:** Usuario · **Prioridad:** Alta
- **Historia:** Como usuario, quiero crear una cuenta e iniciar sesión para que mi asistencia y mis horas queden guardadas a mi nombre y pueda consultarlas en cualquier momento.
- **Criterios de aceptación:**
  - `CA01`: Para crear cuenta se exigen **nombre**, **correo válido** y **contraseña** (mínimo 6 caracteres); no se permite duplicar el correo.
  - `CA02`: Las credenciales válidas permiten acceder a la app (`Mis grupos`); las inválidas muestran un mensaje de error claro sin cerrar ni bloquear la app.
  - `CA03`: Al cerrar sesión se elimina la sesión local y se impide el acceso a cualquier información privada hasta volver a autenticarse.
- **Reglas adicionales:**
  - Existe un solo tipo de cuenta global; el rol (`responsable` o `participante`) depende únicamente de cada grupo.
  - Al crear cuenta en Supabase Auth se crea automáticamente su fila correspondiente en `public.usuarios`.

---

<a id="hu02"></a>

## HU02 · Crear y consultar grupos
- **Requerimiento:** `RF02` (Grupos) · **Actor:** Usuario · **Prioridad:** Alta
- **Historia:** Como usuario, quiero crear grupos y consultar mis membresías para organizar o seguir jornadas.
- **Criterios de aceptación:**
  - `CA01`: Cualquier cuenta puede crear un grupo con **nombre** (obligatorio) y **descripción** (opcional), sin categoría de grupo, y queda registrada automáticamente en `integrantes_grupo` con rol **`responsable`**.
  - `CA02`: Un usuario puede pertenecer a varios grupos simultáneamente, con un único rol en cada uno (ej. responsable en uno y participante en otro).
  - `CA03`: El listado `Mis grupos` muestra únicamente los grupos donde el usuario tiene membresía activa (`retirado_en IS NULL`).

---

<a id="hu03"></a>

## HU03 · Gestionar integrantes
- **Requerimiento:** `RF03` (Integrantes y roles) · **Actor:** Responsable · **Prioridad:** Alta
- **Historia:** Como responsable, quiero gestionar los integrantes para asignar responsabilidades y controlar el acceso.
- **Criterios de aceptación:**
  - `CA01`: Se incorpora por **correo** a una cuenta ya registrada en `usuarios`, sin duplicar membresías activas en el mismo grupo. Si el correo no existe o ya pertenece activamente al grupo, se informa claramente.
  - `CA02`: Cada integrante tiene el rol `responsable` o `participante`, nunca ambos. **El último responsable activo del grupo no puede salir, ser retirado ni ser degradado a participante** (validado en servidor).
  - `CA03`: Al retirar a un integrante o cuando un integrante sale voluntariamente, se llena `retirado_en` (borrado lógico), **se conserva íntegro todo su historial** y se revoca su acceso a nuevas jornadas del grupo.
  - `CA04`: Cambiar el rol de un integrante no modifica sus registros históricos; únicamente los responsables activos administran los integrantes de su grupo.

---

<a id="hu04"></a>

## HU04 · Configurar mi grupo
- **Requerimiento:** `RF04` (Configuración) · **Actor:** Responsable · **Prioridad:** Alta
- **Historia:** Como responsable, quiero elegir cómo se registra la asistencia de mi grupo y si se controlan horas, para registrar solo lo que el grupo necesita sin llevar un control aparte en papel o Excel.
- **Criterios de aceptación:**
  - `CA01`: Se elige la modalidad de asistencia del grupo: **`manual`** (el responsable pasa lista) o **`qr`** (cada participante escanea un código temporal y el responsable puede corregir de forma excepcional).
  - `CA02`: El **`control_horas`** es **independiente de la modalidad** (puede activarse tanto con `manual` como con `qr`). La comprobación de cercanía por GPS (`gps_habilitado`, Media) **requiere** `modalidad_asistencia = 'qr'`.
  - `CA03`: Solo los responsables activos modifican la configuración. Los cambios aplican únicamente a **nuevas jornadas** creadas después del cambio; las jornadas y registros anteriores conservan su configuración original.
  - `CA04`: Tanto la interfaz como el servidor (RLS/RPC) impiden operaciones de funciones deshabilitadas; las correcciones administrativas del responsable siguen disponibles.
- **Nota de conciliación con Wireflow:** el documento T1 (`HU04 CA02`, `HU09 CA01` y Tabla 3 — Encargado de iglesia) manda sobre el borrador del wireflow: el control de horas **sí funciona** en modalidad `manual` y en modalidad `qr`.
