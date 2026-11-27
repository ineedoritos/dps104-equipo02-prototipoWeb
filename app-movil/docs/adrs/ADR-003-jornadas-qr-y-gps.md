# ADR-003 · Jornadas de un día, copia de configuración, QR temporal y GPS puntual en servidor

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
Los grupos pueden cambiar su configuración con el tiempo (`HU04`), el QR debe evitar fraudes o duplicados (`HU08`), y el GPS puntual (`HU11`) no debe exponer mapas ni rastreo continuo (`Tabla 4`, `RNF05`). Además, una jornada que abarque varios días rompe la UX de "asistencia del mismo día".

## Decisión
1. **Terminología y duración de jornada:** la entidad llamada *"actividad"* en el T1 se modela como **`jornadas`**. Toda jornada debe cumplir `fin_en > inicio_en` y comenzar y terminar el **mismo día calendario** en zona horaria `America/El_Salvador` (UTC-6). Eventos de varios días se registran como jornadas individuales separadas.
2. **Snapshot de configuración:** al crear una fila en `jornadas`, **la app** lee los flags vigentes de `grupos` y los envía en el mismo `INSERT` (`modalidad_asistencia`, `control_horas`, `gps_habilitado`, `modo_fotos`, `requiere_validacion`, `notificaciones_habilitadas`). Cambios posteriores en `grupos` no alteran jornadas ya creadas.
3. **QR temporal y regenerable:** `codigos_qr` pertenece `N:1` a `jornadas`. La app genera un token aleatorio, pide al responsable el tiempo de caducidad (5/10/15/30 min, 15 por defecto), calcula `expira_en = min(ahora + caducidad, jornada.fin_en)` y, al regenerar, marca el token anterior con `revocado_en`. No hay trigger: la seguridad real está en `registrar_asistencia_qr`, que rechaza tokens vencidos/revocados y jornadas canceladas o fuera de curso.
4. **Detección automática Entrada/Salida:** si `control_horas = true`, el escaneo QR determina si corresponde `entrada` (no tiene `hora_entrada`) o `salida` (ya tiene `hora_entrada` y no `hora_salida`), mostrando confirmación clara al usuario.
5. **GPS puntual validado en servidor (Media · `HU11`):** el cliente usa `expo-location` (`getCurrentPositionAsync`) solo al fijar la referencia de la jornada y al escanear QR. El RPC `registrar_asistencia_qr` exige `precision_metros <= 50` y distancia Haversine `<= 100` m. Prohibido incluir mapas o rastreo en segundo plano.

## Consecuencias
- **Positivas:** elimina trampa desde el cliente, protege historial ante cambios de configuración y mantiene la UX simple (1 jornada = 1 día).
- **Compromiso:** las jornadas de madrugada que cruzan medianoche quedan fuera de este MVP (coherente con Tabla 4: *sin turnos complejos*).
