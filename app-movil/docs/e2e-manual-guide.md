# Guía de prueba manual End-to-End (Human-in-the-loop · Android)

Este proyecto **no usa tests automatizados** (`ADR-005`). Toda issue y cada corte de fase se validan a mano en un teléfono Android real siguiendo esta guía.

---

## 1. Preparación del entorno de prueba (cuentas demo)
Mantén siempre estas 3 cuentas en el proyecto Supabase de desarrollo para poder correr las pruebas en 5 minutos:
1. **Mariana (`mariana@demo.test`)** — Responsable del grupo *"Iglesia"* (manual + horas) y del grupo *"Fútbol"* (manual sin horas); **Participante** en *"Banco de alimentos"* (QR + horas).
2. **Ana (`ana@demo.test`)** — Participante en *"Iglesia"* y *"Banco de alimentos"*.
3. **Luis (`luis@demo.test`)** — Participante en *"Fútbol"* y *"Iglesia"*.

---

## 2. Protocolo estándar al revisar cualquier PR (3–5 min)
Antes de aprobar un PR de integración, el desarrollador humano verifica:
1. El agente reporta `typecheck` y `lint` en verde.
2. En Android, ejecutar el **Guion E2E específico de la issue** (camino feliz + casos borde).
3. Verificar los **3 estados obligatorios de `RNF04`** en las pantallas tocadas:
   - **Cargando:** aparece indicador visual mientras responde Supabase.
   - **Vacío:** si no hay datos, muestra mensaje claro y acción siguiente (no pantalla en blanco).
   - **Error / sin red:** activa modo avión, intenta la acción y verifica mensaje comprensible + botón de reintento sin que la app se cierre.

---

### Regresión de interfaz móvil (PR #67)

Con Expo Go en un teléfono Android, inicia desde un arranque limpio. En el pase de usuario final, deja desactivada la variable `EXPO_PUBLIC_CONTROLES_PRUEBA`. Para probar estados forzados, cuenta de prueba o simulación de QR, añade `EXPO_PUBLIC_CONTROLES_PRUEBA=1` a `app-movil/.env.local` y reinicia Expo.

1. Abre **Iniciar sesión** con teclado visible. Muestra y oculta la contraseña con el icono de ojo. Verifica que puedes enviar desde el teclado y que el botón sigue al alcance. Repite con el último campo de **Crear grupo**, **Nueva jornada**, **Integrantes** y **Ajustar horas**.
2. Recorre **Mis grupos → Cuenta → Mi historial → Grupo → Reportes → Integrantes → Jornadas**, y luego **Detalle de jornada → Pasar lista → Ajustar horas**. Compara encabezados, barra de estado, sombras y alineación. Alterna las secciones del grupo varias veces y usa Atrás del sistema y de la app. Tras editar una jornada, Atrás debe regresar al grupo.
3. En **Reportes**, prueba **Personalizado** con una pantalla angosta o texto grande. Verifica que puedes leer ambas fechas completas y que el selector evita rangos invertidos. Prueba un período sin datos y otro con datos. Expande el detalle de un integrante con nombre largo y verifica su tasa, motivos y horas, si aplican.
4. Abre un grupo con jornadas. Verifica que **+ Nueva jornada** está antes de la lista y que **Configuración del grupo** se reconoce por el engranaje. Con TalkBack, revisa los nombres de los botones de configuración y contraseña, y el estado seleccionado de las pestañas.
5. En **Integrantes**, prueba **Salir del grupo** como único responsable. Sin candidatos, **Ir a agregar integrante** debe llevar al formulario. Con candidatos, el botón de salida debe quedar deshabilitado hasta seleccionar a alguien. Cancela una vez y comprueba que no cambia ningún rol. Luego confirma y verifica que la persona elegida queda como responsable.
6. En **Mi historial**, comprueba que aparecen los grupos de participación, incluidos los de los que se retiró como participante. Un grupo donde ahora eres responsable, incluso si antes participabas, no debe aparecer. Si el filtro deja de estar disponible, la interfaz vuelve a **Todos**.
7. Verifica la dirección visual en **Iniciar sesión**, **Mis grupos**, **Detalle de jornada**, **Mi historial** y **Reportes**. Comprueba la continuidad del fondo entre la barra de estado y el encabezado, las pestañas y filtros activos, y el contraste de las acciones.
8. En **Nueva jornada**, abre el teclado, introduce un título y confirma que puedes desplazarte hasta el botón. Selecciona fecha y horas, provoca un error de horario y corrígelo. Abre una jornada con asistencia registrada y comprueba que fecha y horas están deshabilitadas.
9. En **Pasar lista**, cambia entre presente, ausente y justificada. Revisa que TalkBack anuncie el estado seleccionado y que el gráfico de **Reportes** identifique las categorías por escrito. Repite con tamaño de fuente ampliado.
10. En el flujo de QR, comprueba que el código y su caducidad caben en pantalla y que la confirmación sigue ofreciendo el regreso al grupo.
8. Con controles de prueba apagados, comprueba que una jornada configurada para QR ofrece registrar la asistencia desde la lista del responsable. Repite con los controles habilitados para recorrer **Mostrar QR → Simular lectura válida → Confirmación → Mi historial**. La lectura y la matriz QR de esta versión son simulaciones locales.

---

## 3. Los 4 Flujos Maestros (obligatorios antes de cada corte de fase y para la prueba del 2–4 dic)

Estos son exactamente los 4 *Task Flows* definidos en la Tabla 3 del T1 y en `docs/artifacts/Flujo de Registro de actividades.html`.

### Flujo 1 · Encargado de iglesia (Responsable · Manual + Control de horas)
- **Objetivo:** registrar asistencia, horas y un ajuste con motivo; luego verificarlo en el reporte.
- **Pasos:**
  1. Inicia sesión como **Mariana** (`SCREEN-01`) → entra a *"Iglesia"* (`SCREEN-02` → `SCREEN-04`).
  2. Crea una jornada hoy que ya haya iniciado (`SCREEN-07`) y ábrela (`SCREEN-08`).
  3. Entra a **Pasar lista** (`SCREEN-09`), marca a **Ana** como `Presente`.
  4. Entra a **Ajustar horas** (`SCREEN-10`), ingresa entrada `08:00`, salida `12:00` (4 h), pon tiempo reconocido `3 h 30 min` e intenta guardar **sin motivo** → debe bloquear y pedir motivo.
  5. Escribe motivo *"Salió 30 min a diligencia"* y guarda → debe persistir.
  6. Ve a **Reportes** (`SCREEN-12`) → verifica que Ana aparece con `1 presente`, `0 ausencias`, `100%`, `4 h` registradas y `3 h 30 min` reconocidas.
- **Criterio de aprobación:** tras cerrar y reabrir la app, los mismos números siguen en Reportes.

### Flujo 2 · Estudiante de servicio social (Participante · QR + Control de horas)
- **Objetivo:** escanear QR de una jornada en curso y comprobar su registro en el historial el mismo día.
- **Pasos:**
  1. En un dispositivo (o sesión responsable), abre una jornada `en_curso` de *"Banco de alimentos"* y muestra el QR (`SCREEN-11`). Elige caducidad `15 min` y verifica que se muestra la cuenta regresiva.
  2. Como **Ana** (participante), entra a *"Banco de alimentos"* (`SCREEN-13`) → toca **Escanear QR** (`SCREEN-14`).
  3. Escanea el QR → confirma pantalla **Entrada registrada** (`SCREEN-15`).
  4. Vuelve a escanear de inmediato en modo sin horas (o verifica un segundo escaneo tras 1 min con horas para marcar **Salida**). Si intentas un 3er escaneo, la app informa que ya quedó completo sin duplicar filas.
  5. Abre **Mi historial** (`SCREEN-16`) → verifica la jornada de hoy con su presencia y horas registradas/reconocidas.
- **Criterio de aprobación:** cero duplicados en BD y el historial coincide con lo escaneado.

### Flujo 3 · Entrenador de fútbol (Responsable · Manual sin control de horas)
- **Objetivo:** pasar lista con presente/ausente/justificada y consultar tasa + motivos en reportes.
- **Pasos:**
  1. Como **Mariana**, abre *"Fútbol"* (configurado en `manual`, `control_horas = false`) y una jornada de hoy (`SCREEN-08` → `SCREEN-09`).
  2. Verifica que **NO** aparecen contadores ni campos de horas en ninguna pantalla del grupo (`HU09 CA05`).
  3. Marca a **Luis** como `Justificada` e intenta guardar sin motivo → debe pedir motivo; escribe *"Enfermedad"* y guarda. Marca a otro participante como `Presente` y deja a uno sin marcar.
  4. Abre **Reportes** (`SCREEN-12`) → verifica que:
     - El participante sin marcar **NO** cuenta como ausente.
     - Luis cuenta la justificada dentro de ausencias para la tasa (`presentes ÷ (presentes + ausencias) × 100`), y al tocar a Luis se ve el motivo *"Enfermedad"*.
- **Criterio de aprobación:** fórmula exacta y motivo visible sin confusión.

### Flujo 4 · Detectar una inconsistencia el mismo día (Núcleo de la hipótesis)
- **Objetivo:** comprobar que un participante detecta un error el mismo día y el responsable lo corrige inmediatamente.
- **Pasos:**
  1. *(Preparación)* Como **Mariana**, edita en `SCREEN-09`/`SCREEN-10` el registro de **Ana** poniéndole 1 hora menos o cambiándola por error a `Ausente`.
  2. Como **Ana**, entra a **Mi historial** (`SCREEN-16`) → abre el registro de hoy (`SCREEN-17`) y comprueba que la diferencia (o el motivo del ajuste) salta a la vista sin tener que preguntar.
  3. Como **Mariana**, corrige el registro en `SCREEN-09` (`Asistencia y correcciones`) y guarda.
  4. Como **Ana**, recarga **Mi historial** (`SCREEN-16`) → el registro corregido aparece actualizado ese mismo día.
- **Criterio de aprobación:** la corrección actualiza la misma fila (sin duplicados) y el participante ve el cambio al instante.

---

## 4. Checklist extra para funciones Media (cuando se implementen)
- **GPS puntual (`HU11`):**
  1. Crear jornada con GPS activo y capturar ubicación de referencia (`SCREEN-07`).
  2. Escanear QR estando en el lugar → confirma registro.
  3. Denegar permiso GPS o probar con coordenada de referencia a > 150 m → servidor rechaza con `ERR_GPS_FUERA_DE_RADIO` y muestra aviso de que el responsable puede registrar manualmente.
  4. Confirmar que **no existe ningún mapa** en la app.
- **Notificaciones + Push Android (`HU16`):**
  1. Con permiso aceptado en Android Dev Build: responsable modifica asistencia de Ana → llega push al celular de Ana **y** aparece en `SCREEN-18` como no leída.
  2. Con permiso denegado: el push no llega, pero la notificación igual aparece en `SCREEN-18`.
  3. Marcar como leída y verificar que al reabrir sigue leída y sin duplicados.
- **Cancelación y último responsable (reglas críticas de integridad):**
  1. Intentar salir/degradar siendo el único responsable de un grupo → servidor bloquea con mensaje claro (`ERR_ULTIMO_RESPONSABLE`).
  2. Cancelar una jornada con asistencias ya registradas (`HU05 CA04`) → verificar que sus registros desaparecen de los totales de `SCREEN-12` y `SCREEN-16` y no permite nuevos registros.
