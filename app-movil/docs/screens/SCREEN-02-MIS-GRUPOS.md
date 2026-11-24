# SCREEN-02 · Mis grupos

- **Wireflow:** `02 Mis grupos`
- **Ruta Expo Router:** `app/(tabs)/index.tsx`
- **Rol:** Usuario autenticado · **Prioridad:** Alta
- **Spec:** `docs/specs/01-acceso-y-grupos.md#hu02`
- **Tablas:** `grupos`, `integrantes_grupo`, `jornadas`

## Contenido y acciones
- Encabezado: *"Mis grupos"* · subtítulo: *"Tu rol cambia según el grupo."* (y acceso a cerrar sesión en pestaña `Cuenta`).
- Lista de tarjetas únicamente de los grupos donde el usuario tiene membresía activa (`retirado_en IS NULL`):
  - Nombre del grupo.
  - Etiqueta de rol: `Responsable` o `Participante`.
  - Resumen rápido: número de integrantes y/o estado de jornada de hoy (*"Jornada en curso ahora"*).
  - Al tocar la tarjeta:
    - Si `rol === 'responsable'` → `SCREEN-04` (`Grupo, vista responsable`).
    - Si `rol === 'participante'` → `SCREEN-13` (`Grupo, vista participante`).
- Nota al pie: *"Solo ves los grupos a los que perteneces."*
- Botón principal flotante o inferior: **`+ Crear grupo`** → `SCREEN-03`.

## Estados obligatorios (`RNF04`)
- **Cargando:** skeleton o spinner al cargar membresías + *pull-to-refresh*.
- **Vacío:** mensaje *"Aún no perteneces a ningún grupo"* con CTA directo a **`+ Crear grupo`**.
- **Error:** banner visible con botón **Reintentar**.
