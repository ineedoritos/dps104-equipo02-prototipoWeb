# SCREEN-12 · Reportes de participación

- **Wireflow:** `12 Reportes`
- **Ruta Expo Router:** `app/grupos/[grupoId]/reportes.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta
- **Spec:** `docs/specs/03-historial-y-reportes.md#hu15`
- **Tablas / RPC:** RPC `obtener_reporte_grupo`

## Contenido y acciones
- Selector de **Período** (chips rápidos): *Últimos 7 días* | *Este mes* | *Todo* | *Personalizado (desde–hasta)*.
- Debajo del selector, **barra apilada** con el total del grupo por categoría en el período seleccionado (presentes, ausencias justificadas, ausencias sin motivo). Mostrar el nombre y el total de cada categoría junto al gráfico para que se puedan leer sin distinguir los colores.
- Tabla / lista de **solo lectura** (sin botones de exportar a PDF/Excel) por integrante:
  - Cada fila muestra el nombre completo, presentes, ausencias y tasa. Si el grupo usa horas, muestra las reconocidas en el resumen y las registradas en el detalle expandido.
  - Al tocar la fila de un integrante, se despliega el detalle de sus ausencias justificadas y motivos (*ej. "2 justificadas: examen en el colegio, enfermedad · 2 sin motivo"*).
- Nota explicativa al pie: *"Tasa = presentes ÷ (presentes + ausencias) × 100. Las justificadas cuentan como ausencia, pero se ve su motivo. Se excluyen jornadas canceladas y asistencias sin registrar. Solo lectura."*

## Implementación en HU15

- Construir la barra con [React Native Gifted Charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts#installation). Instalar `react-native-gifted-charts` y `react-native-svg` con `npx expo install` al implementar `HU15`. Si la versión de React Native es anterior a 0.87, instalar también `expo-linear-gradient` según la guía de la librería.
- Sumar `presentes`, `justificadas` y `ausentes_sin_motivo` por separado a partir de las mismas filas de `obtener_reporte_grupo` que alimentan la tabla.

## Estados obligatorios (`RNF04`)
- **Cargando:** indicador al cambiar de período o cargar reporte.
- **Vacío:** *"No hay registros de asistencia en el período seleccionado"*. Mostrar el gráfico cuando al menos una categoría tenga registros. Si un integrante tiene `0` presentes y `0` ausencias, mostrar `—` en tasa (nunca `NaN`).
- **Error:** aviso visible con botón **Reintentar**.
