# SCREEN-06 · Integrantes

- **Wireflow:** `06 Integrantes`
- **Ruta Expo Router:** `app/grupos/[grupoId]/integrantes.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta
- **Spec:** `docs/specs/01-acceso-y-grupos.md#hu03`
- **Tablas / RPC:** `integrantes_grupo`, `usuarios`, RPC `gestionar_integrante`

## Contenido y acciones
- Formulario superior: campo `Agregar por correo (cuenta existente)` + selector de rol inicial (`Participante` por defecto / `Responsable`) + botón **Agregar**.
- Contador (*ej. "8 integrantes"*) y lista de integrantes activos (`retirado_en IS NULL`):
  - Nombre (indicando `(tú)` en la propia fila) y correo.
  - Selector de rol `Participante | Responsable` para las demás personas. La fila propia muestra el rol actual.
  - Acción **Retirar** (o **Salir del grupo** en la propia fila), con confirmación. Para salir como único responsable, primero elige a otra persona activa para que quede a cargo. Si no hay candidatos, la acción lleva al formulario para agregar a alguien.
- Nota al pie: *"El grupo debe conservar al menos una persona responsable."*

## Estados obligatorios (`RNF04`)
- **Cargando:** spinner en listado y en acciones de agregar/cambiar rol/retirar.
- **Errores específicos de servidor:**
  - `ERR_USUARIO_NO_ENCONTRADO` → *"No existe una cuenta registrada con ese correo."*
  - `ERR_YA_ES_INTEGRANTE` → *"Esta persona ya pertenece al grupo."*
  - `ERR_ULTIMO_RESPONSABLE` → *"Debe quedar al menos un responsable en el grupo."*
- **Vacío:** nunca ocurre porque siempre hay al menos 1 responsable activo.
