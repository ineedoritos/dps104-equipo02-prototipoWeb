# T-k4d8-5 · Validación previa de participación (HU12)

- **Spec:** [`04-funciones-media.md#hu12`](../specs/04-funciones-media.md#hu12) · **Pantallas:** [`SCREEN-05`](../screens/SCREEN-05-CONFIGURACION.md), [`SCREEN-09`](../screens/SCREEN-09-ASISTENCIA-MANUAL.md) y [`SCREEN-17`](../screens/SCREEN-17-DETALLE-REGISTRO.md) · **Columnas:** `asistencias.estado_validacion` y `validado_por` ([`database.md` §1.6](../database.md#tablas-alta))
- **Issue:** #28 · **Rama:** `feature/28-ui-validacion` · Reglas comunes en el [README](README.md).

## Resultado esperado

Si la jornada exige validación, cada registro nuevo queda **pendiente** hasta que un responsable lo apruebe. Las horas incompletas no se aprueban, nadie aprueba su propio registro, y modificar un registro aprobado lo devuelve a pendiente. El participante ve el estado de su registro.

## Datos

`Asistencia` ya tiene `estado_validacion` (`'aprobado' | 'pendiente'`) y `validado_por`. Esta tarea **sí toca** `lib/gruposStore.ts`:

1. `guardarAsistenciasManual`, `ajustarHorasAsistencia` y `registrarAsistenciaQR`:
   - Con `jornada.requiere_validacion`, todo registro nuevo o modificado queda `pendiente` con `validado_por: null`.
   - Sin validación, `aprobado` como hoy (`HU12 CA01` y `CA03`).
2. Funciones nuevas:
   - `aprobarAsistencia(asistenciaId)`.
     - Exige un responsable activo del grupo.
     - Rechaza (`ErrorDominio`) si es el registro propio: "No puedes aprobar tu propio registro." (`validado_por <> participante_id`, `HU12 CA04`).
     - Rechaza si las horas están incompletas, con control de horas y entrada sin salida: "Completa la hora de salida antes de aprobar."
     - Rechaza si la jornada está cancelada.
   - `aprobarCompletos(jornadaId)`: aprueba los pendientes aprobables y devuelve cuántos aprobó y cuántos omitió.
3. Reportes e historial: las horas de registros `pendiente` no suman al total aprobado. Revisa `obtenerReporteGrupo` y `obtenerMiHistorial`: lo que se muestre como "reconocido" sale solo de los aprobados, y los pendientes se cuentan aparte.
4. Si existe `crearNotificacion` (`T-k4d8-1`), avisa al participante con `horas_actualizadas` al aprobar.
5. `data/jornadas.json` y `data/asistenciasGrupo.json`: una jornada con `requiere_validacion: true` y registros pendientes, aprobados y uno con horas incompletas.

## Pantallas y archivos

| Archivo | Cambio |
|---|---|
| `app/grupos/[grupoId]/configuracion.tsx` | **Exigir validación** se habilita (sale de "Próximamente"), con la fila entera tocable y `accessibilityRole="switch"`. Texto: "Los registros cuentan cuando un responsable los aprueba." |
| `app/grupos/[grupoId]/jornadas/[jornadaId]/asistencia.tsx` | Con validación, cada participante con registro muestra `Estado` ("Pendiente" en `peach`, "Aprobado" en `mint`) y un botón **Aprobar** (deshabilitado con horas incompletas, con el motivo en `accessibilityHint`). Arriba, **Aprobar los completos (N)**, que confirma cuántos aprobó y cuántos omitió. |
| `app/grupos/[grupoId]/jornadas/[jornadaId]/index.tsx` | Con validación, en el resumen: "3 pendientes de aprobar". Sin validación, la línea "Esta jornada no exige validación" (`HU12 CA02`). |
| `app/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro.tsx` | Estado de validación del registro propio, con una línea de qué significa ("Tus horas cuentan cuando el responsable las apruebe."). |

Reglas de interfaz:
- La fila propia del responsable (si también tiene registro) no muestra **Aprobar**.
- El estado nunca se comunica solo con color: siempre va el texto "Pendiente" o "Aprobado".

## Fuera de alcance

Reglas en servidor (RLS y triggers). Reportes con horas aprobadas en `app-web`.

## Terminado cuando

- [ ] Con validación, los registros nuevos y modificados quedan pendientes; sin validación, aprobados.
- [ ] No se aprueban horas incompletas ni el registro propio.
- [ ] "Aprobar los completos" informa cuántos aprobó y cuántos omitió.
- [ ] Modificar un registro aprobado lo devuelve a pendiente y sus horas salen del total aprobado.
- [ ] El participante ve el estado en Mi registro.
- [ ] Se actualizaron `SCREEN-05`, `SCREEN-09` y `SCREEN-17`.

## Guion E2E sugerido (Android)

1. Configuración → activar **Exigir validación** → crear una jornada → pasar lista → los registros quedan "Pendiente".
2. Un participante con entrada sin salida → **Aprobar** deshabilitado.
3. **Aprobar los completos** → mensaje con aprobados y omitidos.
4. Ajustar las horas de un aprobado → vuelve a "Pendiente".
5. Como participante → Mi registro muestra "Pendiente" o "Aprobado".
6. Jornada sin validación → el detalle dice que no exige validación.
