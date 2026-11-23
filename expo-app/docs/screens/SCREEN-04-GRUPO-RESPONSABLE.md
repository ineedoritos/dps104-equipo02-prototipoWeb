# SCREEN-04 · Grupo, vista responsable

- **Wireflow:** `04 Grupo, vista responsable`
- **Ruta Expo Router:** `app/grupos/[grupoId]/index.tsx` *(cuando `rol === 'responsable'`)*
- **Rol:** Responsable activo · **Prioridad:** Alta
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu06`
- **Tablas:** `grupos`, `jornadas`

## Contenido y acciones
- Encabezado con nombre del grupo, chip `Responsable`, resumen de configuración vigente (*ej. "Asistencia por QR · con horas"*) e ícono/botón de ajustes → `SCREEN-05` (`Configuración`).
- Navegación interna de secciones del grupo:
  - **Jornadas** *(vista activa)*
  - **Integrantes** → `SCREEN-06`
  - **Reportes** → `SCREEN-12`
- Lista de jornadas agrupadas por **Hoy**, **Próximas** y **Anteriores / Canceladas**:
  - Cada tarjeta muestra título, horario (`inicio_en` – `fin_en`), estado derivado (`En curso`, `Programada`, `Finalizada` o `Cancelada`) y nota clara en canceladas (*"Sus registros no cuentan en los totales"*).
  - Tocar una jornada → `SCREEN-08` (`Detalle de jornada`).
- Botón principal: **`+ Nueva jornada`** → `SCREEN-07`.

## Estados obligatorios (`RNF04`)
- **Cargando:** spinner inicial + *pull-to-refresh*.
- **Vacío:** *"Este grupo aún no tiene jornadas"* + botón **`+ Nueva jornada`**.
- **Error:** aviso visible con reintento; si perdió rol de responsable, regresar a `SCREEN-02`.
