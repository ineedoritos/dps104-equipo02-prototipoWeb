# Spec 03 · Historial personal y reportes de participación

Módulo de consulta de prioridad **Alta** (`RF14`–`RF15`), clave para validar la señal medible de la hipótesis (consulta correcta + detección de inconsistencias el mismo día).

---

<a id="hu14"></a>

## HU14 · Consultar mi historial
- **Requerimiento:** `RF14` (Historial) · **Actor:** Integrante · **Prioridad:** Alta
- **Historia:** Como integrante, quiero consultar mi historial para comprobar mi participación sin depender de otra persona.
- **Criterios de aceptación:**
  - `CA01`: Muestra todos los registros propios del usuario, **incluyendo grupos de los que fue retirado o salió**, con: fecha, título de la jornada, grupo, estado (`presente`, `ausente`, `justificada` con motivo) y horas si aplican. Excluye de los totales las jornadas canceladas (aunque puedan listarse claramente etiquetadas como canceladas).
  - `CA02`: Cuando aplica control de horas, los totales separan claramente **duración registrada**, **tiempo reconocido** y **tiempo pendiente** (cuando exista validación previa), y cada registro ajustado muestra de forma destacada el **`motivo_ajuste`** escrito por el responsable.
  - `CA03`: Si el usuario no tiene registros, se muestra un estado vacío claro; en grupos/jornadas sin control de horas no se muestra contador de horas.
  - `CA04`: Nadie puede consultar registros ajenos sin ser responsable autorizado del grupo correspondiente (protegido por RLS en servidor).
  - `CA05`: El integrante ve, por grupo, su **tasa de asistencia** y el desglose de **presentes**, **justificadas** y **ausentes**.

---

<a id="hu15"></a>

## HU15 · Consultar reportes de participación
- **Requerimiento:** `RF15` (Reportes de participación) · **Actor:** Responsable · **Prioridad:** Alta
- **Historia:** Como responsable, quiero consultar la asistencia y las horas del grupo, con su tasa de asistencia, para tomar decisiones con datos.
- **Criterios de aceptación:**
  - `CA01`: El responsable elige un grupo que administra y un período (filtros rápidos: *Últimos 7 días*, *Este mes*, *Todo* y rango personalizado *desde–hasta*). Se muestra una tabla/lista por integrante con: **presentes**, **ausencias** (desglosando justificadas con sus motivos al tocar el integrante), **tasa de asistencia** y, si el grupo controla horas, **horas registradas y reconocidas**.
  - `CA02`: Fórmula exacta de tasa:
    ```text
    tasa = presentes / (presentes + ausencias) * 100
    ```
    donde:
    - `ausencias = ausentes_sin_motivo + justificadas` (las ausencias justificadas cuentan en el denominador, pero su motivo se muestra al responsable).
    - Se excluyen las **jornadas canceladas** y las jornadas donde el participante **no tiene registro** (sin registro ≠ ausente).
    - Si `presentes + ausencias = 0`, se muestra `—` o `N/A` (nunca división por cero ni `NaN`).
  - `CA03`: Los reportes son de **solo lectura en la app**, sin exportaciones (PDF/Excel) y sin mezclar datos de otros grupos (protegido por RLS y RPC `obtener_reporte_grupo`).
  - `CA04`: Cuando el período tiene registros de asistencia, se muestra una barra apilada con los totales de **presentes**, **ausencias justificadas** y **ausencias sin motivo** del grupo. Cada total coincide con la suma de su categoría en el reporte y se actualiza al cambiar de período. Si el período no tiene registros, se muestra el estado vacío de la pantalla.
