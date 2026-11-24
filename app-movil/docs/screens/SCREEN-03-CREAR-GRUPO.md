# SCREEN-03 · Crear grupo

- **Wireflow:** `03 Crear grupo`
- **Ruta Expo Router:** `app/grupos/crear.tsx`
- **Rol:** Usuario autenticado · **Prioridad:** Alta
- **Spec:** `docs/specs/01-acceso-y-grupos.md#hu02`
- **Tablas:** `grupos` (+ trigger automático en `integrantes_grupo` con `rol = 'responsable'`)

## Contenido y acciones
- Título: *"Crear grupo"*.
- Campos:
  - `Nombre del grupo` (obligatorio).
  - `Descripción` (opcional).
  - *(No pedir categoría de grupo; ver Tabla 4 del T1.)*
- Aviso informativo: *"Quedarás como responsable. Después podrás agregar integrantes y elegir cómo se registra la asistencia."*
- Botón principal: **Crear grupo** → crea registro, inserta membresía como `responsable` y navega a `SCREEN-04` (`Grupo, vista responsable`).

## Estados obligatorios (`RNF04`)
- **Validación cliente:** impedir envío con nombre vacío o solo espacios.
- **Cargando:** deshabilitar botón para evitar doble creación.
- **Error:** mostrar error visible con opción de reintentar sin perder los textos escritos.
