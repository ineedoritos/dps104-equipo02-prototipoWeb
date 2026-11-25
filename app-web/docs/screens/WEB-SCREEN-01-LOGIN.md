# WEB-SCREEN-01 · Iniciar sesión (`/login`)

- **Spec:** `docs/specs/01-acceso-y-shell.md#web-01`
- **RF / RNF:** `RF01`, `RF-WEB-01`, `RNF03`, `RNF04`

## Objetivo
Permitir que cualquier usuario registrado (responsable o participante) inicie sesión en el portal web usando su misma cuenta de Supabase.

## Elementos de UI
- Tarjeta centrada (`Card` de shadcn/ui) con identidad limpia del sistema (*Registro de actividades · Portal de Reportes*).
- Campos: **Correo electrónico** y **Contraseña** (con opción mostrar/ocultar).
- Botón primario **Iniciar sesión** con spinner de carga durante la petición.
- Nota breve informativa: *"Usa la misma cuenta con la que ingresas en la aplicación móvil."*

## Estados obligatorios (`RNF04`)
- **Cargando:** botón deshabilitado con indicador de progreso.
- **Error de credenciales / red:** alerta visible en español claro (sin códigos internos ni stack traces).
- **Sesión ya activa:** redirección automática a `/dashboard` (si administra al menos un grupo) o `/mi-reporte` (si solo es participante).
