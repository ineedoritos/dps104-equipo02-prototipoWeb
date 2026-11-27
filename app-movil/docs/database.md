# Contrato de base de datos · Supabase (PostgreSQL en español)

Diagrama visual interactivo aprobado: `docs/artifacts/ER de Registro de actividades.html`.
Zona horaria de referencia para jornadas de un solo día: **`America/El_Salvador`** (UTC-6). Ver `docs/adrs/ADR-006-zona-horaria.md`.

---

<a id="tablas-alta"></a>

## 1. Tablas de prioridad Alta (6 tablas · `MVP · Alta`)

### 1.1 `public.usuarios` (`RF01` / `HU01`)
| Columna | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | `uuid` | `PK`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Se crea por trigger al registrarse en Supabase Auth. |
| `nombre` | `text` | `NOT NULL CHECK (length(trim(nombre)) > 0)` | Nombre visible del usuario. |
| `correo` | `text` | `NOT NULL UNIQUE` | En minúsculas (`lower(trim(correo))`); usado para agregar integrantes (`HU03`). |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` | |

### 1.2 `public.grupos` (`RF02`, `RF04` / `HU02`, `HU04`)
| Columna | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` | |
| `nombre` | `text` | `NOT NULL CHECK (length(trim(nombre)) > 0)` | |
| `descripcion` | `text` | `NULL` | Opcional. |
| `modalidad_asistencia` | `text` | `NOT NULL DEFAULT 'manual' CHECK (modalidad_asistencia IN ('manual','qr'))` | |
| `control_horas` | `boolean` | `NOT NULL DEFAULT false` | Independiente de `modalidad_asistencia`. |
| `gps_habilitado` | `boolean` | `NOT NULL DEFAULT false` | **Media.** `CHECK (NOT gps_habilitado OR modalidad_asistencia = 'qr')`. |
| `modo_fotos` | `text` | `NOT NULL DEFAULT 'no_permitidas' CHECK (modo_fotos IN ('no_permitidas','opcionales','obligatorias'))` | **Media.** |
| `requiere_validacion` | `boolean` | `NOT NULL DEFAULT false` | **Media.** |
| `notificaciones_habilitadas` | `boolean` | `NOT NULL DEFAULT false` | **Media.** |
| `creado_por` | `uuid` | `NOT NULL REFERENCES public.usuarios(id)` | Trigger inserta automáticamente al creador en `integrantes_grupo` como `'responsable'`. |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` | |

### 1.3 `public.integrantes_grupo` (`RF03` / `HU03`)
| Columna | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` | |
| `grupo_id` | `uuid` | `NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE` | |
| `usuario_id` | `uuid` | `NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE` | |
| `rol` | `text` | `NOT NULL CHECK (rol IN ('responsable','participante'))` | Un único rol por grupo. `cambiar_rol` actualiza esta misma fila (sin historial de roles). |
| `unido_en` | `timestamptz` | `NOT NULL DEFAULT now()` | Informativo (fecha de incorporación). |
| `retirado_en` | `timestamptz` | `NULL` | `NULL` = activo. Al retirar/salir se llena la fecha conservando historial. |

- **Índice único parcial:** `UNIQUE (grupo_id, usuario_id) WHERE retirado_en IS NULL` (sin membresías activas duplicadas).
- **Invariante de servidor:** nunca permitir dejar un grupo con `0` responsables activos (`retirado_en IS NULL AND rol = 'responsable'`).

### 1.4 `public.jornadas` (`RF05`, `RF06`, `RF11` / `HU05`, `HU06`, `HU11`)
| Columna | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` | Equivalente a *"actividad"* en T1. |
| `grupo_id` | `uuid` | `NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE` | |
| `titulo` | `text` | `NOT NULL CHECK (length(trim(titulo)) > 0)` | |
| `descripcion` | `text` | `NOT NULL CHECK (length(trim(descripcion)) > 0)` | |
| `inicio_en` | `timestamptz` | `NOT NULL` | |
| `fin_en` | `timestamptz` | `NOT NULL CHECK (fin_en > inicio_en)` | También validar mismo día calendario en `America/El_Salvador` (`(inicio_en AT TIME ZONE 'America/El_Salvador')::date = (fin_en AT TIME ZONE 'America/El_Salvador')::date`). |
| `cancelada` | `boolean` | `NOT NULL DEFAULT false` | Si `true`, excluye de totales y bloquea nuevos registros. |
| `modalidad_asistencia` | `text` | `NOT NULL CHECK (modalidad_asistencia IN ('manual','qr'))` | Copia (snapshot) al crear: la app envía los valores leídos de `grupos` en el `INSERT` (sin trigger). |
| `control_horas` | `boolean` | `NOT NULL` | Copia al crear. |
| `gps_habilitado` | `boolean` | `NOT NULL DEFAULT false` | Copia al crear. |
| `modo_fotos` | `text` | `NOT NULL DEFAULT 'no_permitidas' CHECK (modo_fotos IN ('no_permitidas','opcionales','obligatorias'))` | Copia al crear. |
| `requiere_validacion` | `boolean` | `NOT NULL DEFAULT false` | Copia al crear. |
| `notificaciones_habilitadas` | `boolean` | `NOT NULL DEFAULT false` | Copia al crear. |
| `ref_latitud` | `double precision` | `NULL` | **Media (`HU11`).** Latitud puntual de referencia. |
| `ref_longitud` | `double precision` | `NULL` | **Media (`HU11`).** Longitud puntual de referencia. |
| `ref_ubicacion_en` | `timestamptz` | `NULL` | **Media (`HU11`).** |
| `creado_por` | `uuid` | `NOT NULL REFERENCES public.usuarios(id)` | |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` | |

- **Trigger de edición (`HU05 CA03`):** si ya existe al menos una fila en `asistencias` o `fotos_jornada` para esa `jornada_id`, rechazar cambios a `inicio_en` o `fin_en`.

### 1.5 `public.codigos_qr` (`RF08` / `HU08`)
| Columna | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` | |
| `jornada_id` | `uuid` | `NOT NULL REFERENCES public.jornadas(id) ON DELETE CASCADE` | Relación `N:1` (permite regenerar QRs). |
| `codigo_hash` | `text` | `NOT NULL UNIQUE` | Token aleatorio opaco (o hash SHA-256). |
| `expira_en` | `timestamptz` | `NOT NULL` | Lo calcula la app: `min(ahora + caducidad elegida, jornada.fin_en)` (5/10/15/30 min, 15 por defecto). El RPC QR lo valida. |
| `revocado_en` | `timestamptz` | `NULL` | La app lo llena al regenerar. Al cancelar no hace falta: el RPC rechaza jornadas canceladas. |
| `generado_por` | `uuid` | `NOT NULL REFERENCES public.usuarios(id)` | |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` | |

### 1.6 `public.asistencias` (`RF07`–`RF09`, `RF12`, `RF14`, `RF15`)
| Columna | Tipo | Restricción | Notas |
|---|---|---|---|
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` | |
| `jornada_id` | `uuid` | `NOT NULL REFERENCES public.jornadas(id) ON DELETE CASCADE` | |
| `participante_id` | `uuid` | `NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE` | |
| `estado` | `text` | `NOT NULL CHECK (estado IN ('presente','ausente','justificada'))` | Sin fila ≠ ausente. |
| `motivo_ausencia` | `text` | `NULL` | `CHECK (estado <> 'justificada' OR length(trim(coalesce(motivo_ausencia,''))) > 0)`. |
| `origen` | `text` | `NOT NULL CHECK (origen IN ('manual','qr'))` | |
| `hora_entrada` | `timestamptz` | `NULL` | Solo si `jornada.control_horas = true` y `estado = 'presente'`. |
| `hora_salida` | `timestamptz` | `NULL CHECK (hora_salida IS NULL OR hora_salida > hora_entrada)` | |
| `duracion_minutos` | `integer` | `NULL CHECK (duracion_minutos IS NULL OR duracion_minutos >= 0)` | `floor(extract(epoch from (hora_salida - hora_entrada)) / 60)`. |
| `minutos_reconocidos` | `integer` | `NULL CHECK (minutos_reconocidos IS NULL OR (minutos_reconocidos >= 0 AND minutos_reconocidos <= duracion_minutos))` | |
| `motivo_ajuste` | `text` | `NULL` | Obligatorio si `minutos_reconocidos < duracion_minutos`. |
| `estado_validacion` | `text` | `NOT NULL DEFAULT 'aprobado' CHECK (estado_validacion IN ('aprobado','pendiente'))` | En `MVP · Alta`, `'aprobado'` cuando `requiere_validacion = false`. |
| `validado_por` | `uuid` | `NULL REFERENCES public.usuarios(id)` | `CHECK (validado_por IS NULL OR validado_por <> participante_id)`. |
| `actualizado_por` | `uuid` | `NOT NULL REFERENCES public.usuarios(id)` | |
| `actualizado_en` | `timestamptz` | `NOT NULL DEFAULT now()` | |

- **Restricción de unicidad:** `UNIQUE (jornada_id, participante_id)`.
- **Regla ausencias sin horas:** si `estado IN ('ausente','justificada')`, `hora_entrada`, `hora_salida`, `duracion_minutos`, `minutos_reconocidos` y `motivo_ajuste` deben quedar `NULL`.

---

<a id="tablas-media"></a>

## 2. Tablas de prioridad Media (4 tablas · `MVP · Media`)

### 2.1 `public.fotos_jornada` (`RF10` / `HU10`)
- `id (uuid PK)`, `jornada_id (uuid FK)`, `autor_id (uuid FK)`, `ruta_storage (text NOT NULL)`, `retirada_en (timestamptz NULL)`, `retirada_por (uuid NULL FK)`, `creado_en (timestamptz DEFAULT now())`.

### 2.2 `public.solicitudes_revision` (`RF13` / `HU13`)
- `id (uuid PK)`, `jornada_id (uuid FK)`, `participante_id (uuid FK)`, `motivo_solicitud (text NOT NULL)`, `estado (text CHECK IN ('pendiente','resuelta','rechazada') DEFAULT 'pendiente')`, `motivo_resolucion (text NULL)`, `resuelta_por (uuid NULL FK)`, `creado_en (timestamptz DEFAULT now())`, `resuelta_en (timestamptz NULL)`.
- **Índice único parcial:** `UNIQUE (jornada_id, participante_id) WHERE estado = 'pendiente'`.

### 2.3 `public.notificaciones` (`RF16` / `HU16`)
- `id (uuid PK)`, `usuario_id (uuid FK)`, `jornada_id (uuid NULL FK)`, `tipo_evento (text CHECK IN ('asistencia_modificada','horas_actualizadas','solicitud_revision'))`, `clave_unica (text NOT NULL UNIQUE)`, `titulo (text NOT NULL)`, `mensaje (text NOT NULL)`, `leida (boolean NOT NULL DEFAULT false)`, `creado_en (timestamptz DEFAULT now())`.

### 2.4 `public.tokens_push` (`RF16` / `HU16`)
- `id (uuid PK)`, `usuario_id (uuid FK)`, `expo_push_token (text NOT NULL UNIQUE)`, `plataforma (text NOT NULL CHECK (plataforma IN ('android','ios')))`, `activo (boolean NOT NULL DEFAULT true)`, `actualizado_en (timestamptz DEFAULT now())`.

---

<a id="rls"></a>

## 3. Políticas RLS (versión simplificada para el MVP)
La app usa la `anon key` (pública dentro del APK), así que RLS es lo que impide leer o modificar datos ajenos (`RNF03`). Se mantiene **mínima**: 2 funciones de ayuda y la misma idea en todas las tablas.

Funciones auxiliares SQL `STABLE SECURITY DEFINER` (evitan recursión de políticas sobre `integrantes_grupo`):
- `es_integrante(p_grupo_id uuid)`: `auth.uid()` tiene membresía activa (`retirado_en IS NULL`) en el grupo.
- `es_responsable(p_grupo_id uuid)`: igual, y además `rol = 'responsable'`.

| Tabla | Leer (SELECT) | Escribir (INSERT / UPDATE) |
|---|---|---|
| `usuarios` | Fila propia **o** usuarios que comparten un grupo activo contigo (para ver nombres en integrantes, lista y reportes). | `UPDATE` solo del propio `nombre`. La fila se crea por trigger de Auth. |
| `grupos` | `es_integrante(id)` **o** tienes asistencias en ese grupo (historial `HU14`). | `INSERT` cualquier autenticado (`creado_por = auth.uid()`); `UPDATE` solo `es_responsable(id)`. |
| `integrantes_grupo` | `es_integrante(grupo_id)` **o** `usuario_id = auth.uid()`. | Solo vía RPC `gestionar_integrante` (y trigger al crear grupo). |
| `jornadas` | `es_integrante(grupo_id)` **o** tienes asistencia en esa jornada. | `INSERT` / `UPDATE` solo `es_responsable(grupo_id)`. |
| `codigos_qr` | Solo `es_responsable` del grupo de la jornada. | Solo `es_responsable` del grupo de la jornada. |
| `asistencias` | `participante_id = auth.uid()` **o** `es_responsable` del grupo. | Sin escritura directa: solo los RPCs `registrar_asistencia_manual` / `registrar_asistencia_qr`. |
| *Tablas Media* | Se agregan con la issue de cada función, siguiendo el mismo patrón (dueño o integrante/responsable del grupo). | |

---|---|---|
| `usuarios` | Propio usuario; responsables pueden buscar por correo exacto vía RPC. | Solo propio `nombre` (creación vía trigger de Auth). |
| `grupos` | Solo si `es_integrante(id)` o tuvo asistencias previas (para mostrar nombre del grupo en historial `HU14`). | INSERT cualquier autenticado; UPDATE solo `es_responsable(id)`. |
| `integrantes_grupo` | Si `es_integrante(grupo_id)` o `usuario_id = auth.uid()`. | Solo mediante RPC `gestionar_integrante` (y trigger al crear grupo). |
| `jornadas` | Si `es_integrante(grupo_id)` o el usuario tiene fila en `asistencias` para esa jornada (`HU14`). | INSERT/UPDATE solo `es_responsable(grupo_id)`. |
| `codigos_qr` | Solo `es_responsable(jornada.grupo_id)`. | INSERT/UPDATE solo `es_responsable(jornada.grupo_id)`. |
| `asistencias` | `participante_id = auth.uid()` **o** `es_responsable(jornada.grupo_id)`. | Escrituras controladas por RPCs `registrar_asistencia_manual` y `registrar_asistencia_qr`. |
| `fotos_jornada` | `es_integrante(jornada.grupo_id)` y `retirada_en IS NULL`. | INSERT integrantes activos si `modo_fotos <> 'no_permitidas'`; UPDATE (`retirada_en`) solo responsables. |
| `solicitudes_revision` | `participante_id = auth.uid()` o `es_responsable(jornada.grupo_id)`. | INSERT participante elegible; UPDATE (resolución) solo responsable activo. |
| `notificaciones` / `tokens_push` | Solo `usuario_id = auth.uid()`. | `notificaciones`: UPDATE `leida` por dueño (INSERT por servidor). `tokens_push`: CRUD por dueño. |

---

## 4. Contrato de los 4 RPCs del servidor

<a id="rpc-gestionar-integrante"></a>

### 4.1 `gestionar_integrante(p_grupo_id, p_accion, p_correo, p_usuario_id, p_rol)`
- `p_accion`: `'agregar' | 'cambiar_rol' | 'retirar' | 'salir'`.
- Valida `es_responsable(p_grupo_id)` (salvo `'salir'`, que valida que `auth.uid()` es integrante activo).
- Bloquea dejar el grupo sin responsables activos (`ERR_ULTIMO_RESPONSABLE`).
- Al agregar por correo, busca en `usuarios` sin filtrar si no existe (devuelve `ERR_USUARIO_NO_ENCONTRADO` o `ERR_YA_ES_INTEGRANTE`).

<a id="rpc-registrar-asistencia-manual"></a>

### 4.2 `registrar_asistencia_manual(p_jornada_id, p_participante_id, p_estado, p_motivo_ausencia, p_hora_entrada, p_hora_salida, p_minutos_reconocidos, p_motivo_ajuste)`
- Valida que `auth.uid()` sea `responsable` activo del grupo.
- Valida jornada iniciada (`now() >= inicio_en`) y `cancelada = false`.
- Valida que `p_participante_id` sea integrante activo (`retirado_en IS NULL`) con rol actual `'participante'`.
- Si `p_estado IN ('ausente','justificada')`, limpia horas y exige `p_motivo_ausencia` si es `'justificada'`.
- Si `p_estado = 'presente'` y `jornada.control_horas = true`: valida no futuras, dentro de `[inicio_en, fin_en]`, `hora_salida > hora_entrada`, sin solapamiento con otra jornada del mismo participante, calcula `duracion_minutos` y exige `p_motivo_ajuste` si `p_minutos_reconocidos < duracion_minutos`.
- Hace `UPSERT` sobre `(jornada_id, participante_id)` con `origen = 'manual'`. Si `requiere_validacion = true`, deja `estado_validacion = 'pendiente'`.

<a id="rpc-registrar-asistencia-qr"></a>

### 4.3 `registrar_asistencia_qr(p_codigo, p_latitud, p_longitud, p_precision_metros)`
- Busca token en `codigos_qr` vigente (`revocado_en IS NULL AND expira_en >= now()`).
- Verifica que la jornada esté `en_curso`, `cancelada = false` y `modalidad_asistencia = 'qr'`.
- Verifica que `auth.uid()` sea integrante activo con rol actual `'participante'`.
- Si `jornada.gps_habilitado = true` *(Media)*: exige `p_latitud`, `p_longitud`, `p_precision_metros <= 50` y distancia Haversine `<= 100` m contra `(ref_latitud, ref_longitud)`.
- **Sin `control_horas`:** si ya existe registro `'presente'`, devuelve `{ tipo_marca: 'ya_registrada', duplicado: true }` sin duplicar; si no, inserta `'presente'`.
- **Con `control_horas`:** si no tiene `hora_entrada`, registra `entrada = now()`; si ya tiene `hora_entrada` y no `hora_salida` (y `now() > hora_entrada`), registra `salida = now()`, calcula `duracion_minutos` y asigna `minutos_reconocidos = duracion_minutos`; si ya tiene ambas, devuelve `{ tipo_marca: 'completa', duplicado: true }`.
- Valida que no haya solapamiento de horas con otra jornada del participante.

<a id="rpc-obtener-reporte-grupo"></a>

### 4.4 `obtener_reporte_grupo(p_grupo_id, p_desde, p_hasta)`
- Verifica `es_responsable(p_grupo_id)`.
- Considera solo jornadas del grupo con `cancelada = false` dentro del rango `[p_desde, p_hasta]` (o todas si son `NULL`).
- Devuelve por integrante (incluyendo históricos con registros en el período):
  `usuario_id`, `nombre`, `presentes`, `ausentes_sin_motivo`, `justificadas`, `ausencias_total`, `tasa_asistencia` (`NULL` si `presentes + ausencias_total = 0`), `minutos_registrados`, `minutos_reconocidos`, `motivos_justificadas` (arreglo/JSON con fecha y motivo).

<a id="errores"></a>

## 5. Códigos de error estándar (para UI clara · RNF04)
Todos los RPCs lanzan errores con código legible en el mensaje para que la app muestre textos claros en español:
`ERR_NO_AUTORIZADO`, `ERR_ULTIMO_RESPONSABLE`, `ERR_USUARIO_NO_ENCONTRADO`, `ERR_YA_ES_INTEGRANTE`, `ERR_JORNADA_CANCELADA`, `ERR_JORNADA_NO_INICIADA`, `ERR_HORARIO_BLOQUEADO`, `ERR_NO_ELEGIBLE`, `ERR_QR_INVALIDO_O_VENCIDO`, `ERR_GPS_SIN_PRECISION`, `ERR_GPS_FUERA_DE_RADIO`, `ERR_HORA_INVALIDA`, `ERR_SOLAPAMIENTO_HORAS`, `ERR_MOTIVO_OBLIGATORIO`, `ERR_SOLICITUD_PENDIENTE`.
