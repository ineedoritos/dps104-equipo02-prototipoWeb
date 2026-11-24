# SCREEN-01 · Iniciar sesión y Crear cuenta

- **Wireflow:** `01 Iniciar sesión`
- **Ruta Expo Router:** `app/(auth)/login.tsx` *(alterna entre modo Iniciar sesión y Crear cuenta, o sub-ruta `register.tsx`)*
- **Rol:** Usuario no autenticado · **Prioridad:** Alta
- **Spec:** `docs/specs/01-acceso-y-grupos.md#hu01`
- **Tablas:** `auth.users` → trigger → `public.usuarios`

## Contenido y acciones
- Encabezado: *"Registro de actividades"* · subtítulo: *"Tu asistencia y tus horas, el mismo día."*
- **Modo Iniciar sesión:**
  - Campos: `Correo`, `Contraseña`.
  - Botón principal: **Iniciar sesión** → navega a `SCREEN-02` (`Mis grupos`).
  - Enlace secundario: *"¿No tienes cuenta? Crear cuenta"*.
- **Modo Crear cuenta:**
  - Campos: `Nombre completo`, `Correo`, `Contraseña` (mínimo 6 caracteres).
  - Botón principal: **Crear cuenta** → crea usuario en Auth + `public.usuarios` y navega a `SCREEN-02`.
- Nota informativa al pie: *"Hay un solo tipo de cuenta. Tu rol depende de cada grupo."*

## Estados obligatorios (`RNF04`)
- **Cargando:** deshabilitar botón y mostrar spinner mientras responde Supabase Auth.
- **Error:** mensajes claros en español para correo inválido, correo duplicado, contraseña < 6 caracteres, credenciales incorrectas o falta de red.
- **Sesión existente:** si ya hay sesión válida al abrir la app, redirige directo a `SCREEN-02`.
