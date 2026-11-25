# Spec Web 01 · Acceso, sesión y shell por rol de grupo

Módulo base de autenticación y navegación de `app-web`.
Relacionado con: `RF01`, `RF02`, `RF-WEB-01`, `RNF02`, `RNF03`, `RNF04`, `RNF-WEB-01`.

---

<a id="web-01"></a>

## WEB-01 · Autenticación Supabase y contexto por rol de grupo
- **Requerimientos:** `RF01`, `RF02`, `RF-WEB-01`, `RNF03`, `RNF04`
- **Actores:** Cualquier usuario registrado (Responsable y/o Participante)
- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero iniciar sesión en la web con mi cuenta y elegir entre mis grupos o mi reporte personal para consultar la información que me corresponde según mi rol en cada grupo.

### Criterios de aceptación
- `WEB01-CA01`: El formulario `/login` autentica contra Supabase Auth usando correo y contraseña (`signInWithPassword`), mostrando mensajes claros en español ante credenciales inválidas, campos vacíos o error de red (`RNF04`).
- `WEB01-CA02`: Cualquier usuario autenticado puede ingresar al portal (no existe bloqueo por tipo de cuenta global). Si intenta acceder a rutas protegidas sin sesión, es redirigido a `/login`.
- `WEB01-CA03`: Al iniciar sesión, el shell carga los grupos activos del usuario (`integrantes_grupo` con `retirado_en IS NULL`) mostrando en el selector de grupo el **nombre del grupo** y su **badge de rol** (`Responsable` o `Participante`).
- `WEB01-CA04`: La navegación lateral se adapta automáticamente al contexto activo:
  - **Contexto Grupo (`rol = 'responsable'`):** habilita *Dashboard*, *Reportes del grupo*, *Jornadas* y (en Media) *Auditoría*.
  - **Contexto Grupo (`rol = 'participante'`) o vista global *Mi reporte*:** habilita *Mi reporte personal* (filtrado por ese grupo o consolidado de todos sus grupos, incluyendo ex-grupos con historial).
  - Si el usuario intenta navegar por URL directa a una ruta de responsable de un grupo donde solo es participante (o al que no pertenece), la UI muestra estado de acceso no autorizado y Supabase RLS/RPC bloquea cualquier lectura ajena (`RNF03`).
- `WEB01-CA05`: Si el usuario no pertenece a ningún grupo activo pero tiene historial en ex-grupos, accede directamente a *Mi reporte personal*. Si no tiene grupos ni registros, ve un estado vacío orientativo indicando que puede unirse o crear un grupo desde la app móvil.
- `WEB01-CA06`: Cerrar sesión (`signOut`) invalida la sesión local, limpia el estado en memoria y redirige a `/login` impidiendo volver atrás a datos protegidos.
