---
version: alpha
name: Registro de actividades
description: Interfaz operativa Android con fondo blanco, tinta casi negra y color reservado a estados y métricas.
colors:
  paper: "#FFFFFF"
  surface: "#FFFFFF"
  surfaceAlt: "#F5F5F5"
  ink: "#181818"
  inkMuted: "#525252"
  accent: "#181818"
  present: "#186246"
  scheduled: "#504280"
  excused: "#785014"
  absent: "#A02E32"
typography:
  primary: "Sans del sistema Android (Roboto), con cifras tabulares"
rounded:
  field: "12dp"
  card: "16dp"
  pill: "999dp"
spacing:
  base: "4dp / 8dp / 12dp / 16dp / 24dp / 32dp / 48dp"
---

# Dirección visual

La app acompaña el registro y la consulta de asistencia en teléfono. Usa fondo blanco, títulos de tinta oscura y superficies grises para agrupar cifras. Los nombres de grupos, jornadas y personas llevan la jerarquía. La acción principal se reconoce por su fondo negro y su texto blanco.

## Patrones

- **Acceso.** Un encabezado con el nombre de la app y un formulario abierto de una columna. El campo enfocado y el botón de envío deben seguir al alcance con el teclado abierto.
- **Mis grupos, Jornadas e Historial.** Las listas se leen por filas separadas por líneas finas. Los títulos admiten varias líneas. Los indicadores de estado conservan texto además del color.
- **Reportes.** Los filtros seleccionados se distinguen con relleno negro. Los datos se agrupan sobre gris claro y el gráfico usa verde, ámbar y rojo con leyendas y recuentos explícitos.
- **Navegación.** Los encabezados y la zona de la barra de estado comparten fondo blanco. La pestaña inferior activa adopta una cápsula oscura detrás del icono.

## Color

Verde para presencia o jornada en curso, violeta para una jornada programada, ámbar para una justificación o ajuste, y rojo para ausencia, cancelación y error. El azul apagado acompaña avisos informativos. Los controles generales y los roles usan tonos neutros. La UI conserva el tema claro.

## Evidencia

- [Mira Life](https://www.awwwards.com/sites/miralife-app). La [captura de la candidatura](https://assets.awwwards.com/awards/submissions/2026/08/6a915a36af977399182937.png), consultada mediante Awwwards MCP, muestra fondo blanco y toques de color asociados a indicadores. La navegación y los componentes de esta app se diseñaron para sus propios flujos de trabajo.
- [Tirus](https://www.awwwards.com/sites/tirus-app). La [evidencia histórica](./design-evidence.json) corresponde al estudio anterior de superficies cálidas. Conservamos de esa etapa la tipografía, el ritmo de espaciado y los divisores.

Los valores completos y los componentes se describen en el [sistema visual](./sistema-visual.md). Los tokens ejecutables viven en [tema.ts](../../lib/tema.ts).
