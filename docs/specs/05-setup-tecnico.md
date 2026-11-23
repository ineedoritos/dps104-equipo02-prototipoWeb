# Spec 05 · Setup técnico: stack, fuentes oficiales y Supabase free tier

Spec de soporte para las issues `[SETUP-01]` y `[SETUP-02]`. Las decisiones están cerradas en `ADR-001`, `ADR-002` y `ADR-006`; aquí se dice **qué se instala, cómo y cómo se verifica**.

> **Regla de versiones:** usar la versión **estable vigente** al momento de crear el proyecto (`npx rn-new@latest`, ver §4) y **anotarla en la tabla §1** dentro del mismo PR de `[SETUP-01]`. No mezclar NativeWind v2/v4 (`ADR-001`).

---

<a id="stack"></a>

## 1. Stack técnico

| Capa | Tecnología | Versión fijada | Uso |
|---|---|---|---|
| Runtime | Node.js LTS + npm | *(anotar)* | Herramientas de desarrollo. |
| App | Expo SDK (managed) + React Native + **TypeScript estricto** | *(anotar)* | App Android (`RNF01`). |
| Navegación | Expo Router | la del SDK | `(auth)`, `(tabs)`, `grupos/[grupoId]/...` (`docs/screens/README.md`). |
| Estilos | **NativeWind v4** + Tailwind CSS 3.x | *(anotar)* | Clases utilitarias (`ADR-001`). |
| Estado compartido | Redux Toolkit (`@reduxjs/toolkit`) + React Redux (`react-redux`) | *(anotar)* | Dependencias en `SETUP-01`. Configuración en la primera historia que necesite estado compartido (`ADR-001`). |
| Backend | Supabase Cloud **Free** (Auth + PostgreSQL + API + Storage) | — | `ADR-002`. |
| Cliente BD | `@supabase/supabase-js` v2 + `@react-native-async-storage/async-storage` + `react-native-url-polyfill` | *(anotar)* | Sesión persistente y llamadas RPC. |
| Migraciones | Supabase CLI (vía `npx supabase`) | *(anotar)* | SQL versionado en `supabase/migrations/`. |
| Calidad | `tsc --noEmit` + `expo lint` (ESLint) | — | `typecheck` y `lint` (`ADR-005`). **Sin tests automatizados.** |
| Hardware *(según issue)* | `expo-camera` (`HU08b`), `expo-location` (`HU11`), `expo-notifications` + `expo-device` + `expo-dev-client` (`SETUP-03`) | la del SDK | Instalar **solo** en la issue que lo usa, con `npx expo install`. |
| Push *(Media)* | Firebase (plan **Spark**, gratis) solo para FCM v1 + EAS (Expo) + Supabase Edge Functions | — | `ADR-004`, `[SETUP-03]`. |

---

<a id="fuentes"></a>

## 2. Fuentes de documentación oficial (consultar antes de adivinar)

| Tema | Enlace |
|---|---|
| Create Expo Stack (`rn-new`) | https://github.com/roninoss/create-expo-stack · https://www.npmjs.com/package/rn-new |
| Crear proyecto Expo (alternativa manual) | https://docs.expo.dev/more/create-expo/ |
| Expo Router (rutas, grupos, layouts) | https://docs.expo.dev/router/introduction/ |
| Variables de entorno `EXPO_PUBLIC_*` | https://docs.expo.dev/guides/environment-variables/ |
| ESLint en Expo (`expo lint`) | https://docs.expo.dev/guides/using-eslint/ |
| TypeScript en Expo | https://docs.expo.dev/guides/typescript/ |
| NativeWind (instalación con Expo) | https://www.nativewind.dev/ *(usar la guía de la v4)* |
| Redux Toolkit y React Redux | https://redux.js.org/toolkit/introduction/getting-started · https://redux.js.org/react-redux/introduction/getting-started |
| Supabase + Expo React Native (tutorial oficial) | https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native |
| Supabase Auth (correo y contraseña) | https://supabase.com/docs/guides/auth/passwords |
| Row Level Security | https://supabase.com/docs/guides/database/postgres/row-level-security |
| Funciones SQL / RPC | https://supabase.com/docs/guides/database/functions |
| Supabase CLI | https://supabase.com/docs/guides/local-development/cli/getting-started |
| Migraciones de BD | https://supabase.com/docs/guides/deployment/database-migrations |
| Límites del plan Free | https://supabase.com/pricing |
| Development builds | https://docs.expo.dev/develop/development-builds/introduction/ |
| Push notifications en Expo (setup) | https://docs.expo.dev/push-notifications/push-notifications-setup/ |
| Credenciales FCM v1 en Expo | https://docs.expo.dev/push-notifications/fcm-credentials/ |
| EAS Build (setup) | https://docs.expo.dev/build/setup/ |
| Supabase Edge Functions + push (ejemplo oficial) | https://supabase.com/docs/guides/functions/examples/push-notifications |
| Planes de Firebase (Spark gratis) | https://firebase.google.com/pricing |
| `expo-camera` / `expo-location` / `expo-notifications` | https://docs.expo.dev/versions/latest/ |

---

<a id="estructura"></a>

## 3. Estructura del repositorio

```text
app/                    # Rutas Expo Router (ver docs/screens/README.md)
components/             # Componentes UI reutilizables (estados cargando/vacío/error)
lib/
├── supabase.ts         # Cliente único (URL + anon key desde EXPO_PUBLIC_*)
├── fecha.ts            # Helper de zona America/El_Salvador (ADR-006)
└── errores.ts          # Mapa ERR_* → mensaje en español (database.md#errores)
types/                  # Tipos de dominio (y mocks tipados de Fase 2)
supabase/
├── migrations/         # SQL versionado (esquema, RLS, triggers, RPCs)
└── seed.sql            # Datos demo (grupos Iglesia / Fútbol / Banco de alimentos)
.env.example            # Plantilla SIN valores reales
```

**Scripts mínimos en `package.json`:**
```json
{
  "typecheck": "tsc --noEmit",
  "lint": "expo lint"
}
```

---

<a id="setup-01"></a>

## 4. `[SETUP-01]` · Base de la app

1. Generar la base con **Create Expo Stack** (paquete `rn-new`), que ya deja Expo Router + NativeWind configurados (Babel, Metro, `tailwind.config.js`, `global.css`):
   ```bash
   npx rn-new@latest --help          # confirmar los flags vigentes antes de usarlos
   npx rn-new@latest registro-actividades --expo-router --tabs --nativewind --noGit
   ```
   - `--noGit`: el repo ya existe; mover el contenido generado a la raíz del repo (sin pisar `docs/`, `AGENTS.md` ni `.gitignore`; fusionar el `.gitignore` generado con el actual).
   - **No** usar `--supabase` ni plantillas de auth: el cliente se escribe en `[SETUP-02]` según §5.3.
   - Verificar en `package.json` que `nativewind` quedó en **v4** (`ADR-001`). Si el generador instala otra versión mayor, anotarlo en el PR y actualizar `ADR-001` antes de seguir.
2. Activar `"strict": true` en `tsconfig.json` y comprobar que una pantalla real renderiza clases NativeWind.
   - Fijar en `app.json` el identificador Android **definitivo**: `"android": { "package": "sv.udb.registroactividades" }`. Firebase (`[SETUP-03]`) queda atado a este valor; cambiarlo después obliga a rehacer credenciales.
3. Crear el esqueleto de rutas: `(auth)/login`, `(tabs)` con 4 pestañas (`Mis grupos`, `Mi historial`, `Notificaciones`, `Cuenta`) y una ruta interna `grupos/[grupoId]`.
4. Crear `lib/fecha.ts` (`ADR-006`) y añadir los scripts `typecheck` y `lint`.
5. Instalar las dependencias de Redux Toolkit y React Redux desde la raíz del proyecto:
   ```bash
   npm install @reduxjs/toolkit react-redux
   ```
   El store, el `Provider` y los slices se incorporan en la primera historia que necesite estado compartido.
6. Anotar versiones en §1.

**Criterios de aceptación:**
- `SETUP01-CA01`: La app abre en Android (Expo Go o dev build) y navega entre las 4 pestañas y una pantalla de pila interna.
- `SETUP01-CA02`: Una pantalla real muestra estilos NativeWind aplicados (smoke test visual de `ADR-001`).
- `SETUP01-CA03`: `npm run typecheck` y `npm run lint` terminan sin errores.
- `SETUP01-CA04`: `@reduxjs/toolkit` y `react-redux` figuran como dependencias directas en `package.json` y sus versiones aparecen en `npm ls @reduxjs/toolkit react-redux --depth=0` y en la tabla de stack (§1).

---

<a id="setup-02"></a>

## 5. `[SETUP-02]` · Montar Supabase (free tier, sin tarjeta)

### 5.1 Proyecto y acceso
1. Entrar a https://supabase.com con la cuenta de GitHub → crear organización plan **Free**.
2. **New project:** nombre `registro-actividades-udb`, región más cercana a El Salvador (ej. *East US*), contraseña de BD fuerte guardada en un gestor de contraseñas (**nunca en el repo**).
3. Invitar al otro integrante a la organización (*Organization settings → Team*).

### 5.2 Autenticación
1. *Authentication → Sign In / Providers → Email*: habilitado.
2. **Desactivar "Confirm email"**: el SMTP integrado del plan Free tiene un límite muy bajo de correos por hora y `HU01` no exige confirmar el correo; así la prueba con 3 usuarios no se bloquea.
3. Contraseña mínima: 6 caracteres (coincide con `HU01 CA01`).

### 5.3 Llaves y variables de entorno
1. *Project Settings → API*: copiar **Project URL** y la llave **anon / publishable** (pública).
2. Crear `.env` local (ignorado por git) y `.env.example` en el repo:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-o-publishable-key>
   ```
3. **Prohibido** copiar `service_role` / *secret key* a la app, al `.env` de la app o al repo (`RNF03`).
4. `lib/supabase.ts` crea el cliente con `AsyncStorage`, `autoRefreshToken`, `persistSession` y `detectSessionInUrl: false` (según el tutorial oficial de Expo).

### 5.4 Esquema por migraciones (Supabase CLI, solo nube, sin Docker)
```bash
npx supabase login
npx supabase init                       # crea supabase/
npx supabase link --project-ref <ref>   # pide la contraseña de BD
npx supabase migration new esquema_inicial
# escribir el SQL en supabase/migrations/<fecha>_esquema_inicial.sql
npx supabase db push                    # aplica en el proyecto cloud
```
La migración inicial incluye, en este orden:
1. `ALTER DATABASE postgres SET timezone TO 'America/El_Salvador';` (`ADR-006`).
2. Las 10 tablas de `docs/database.md` (Alta + Media), con sus `CHECK`, `UNIQUE` e índices parciales.
3. Triggers: `auth.users` → `public.usuarios`; creador del grupo → `integrantes_grupo` como `responsable`; horario fijo de jornada si ya hay asistencias o fotos.
4. Funciones `es_integrante` / `es_responsable` y RLS simplificada de `docs/database.md#rls` (**habilitar RLS en todas las tablas de `public`**).
5. Los 4 RPCs se agregan en **migraciones nuevas** dentro de su issue (`HU03`, `HU07a`, `HU08b`, `HU15`), nunca editando una migración ya aplicada.

### 5.5 Datos demo
1. Crear las 3 cuentas demo de `docs/e2e-manual-guide.md` (*Authentication → Users → Add user*, con "Auto confirm").
2. Ejecutar `supabase/seed.sql` en el *SQL Editor*: crea los grupos *Iglesia*, *Fútbol* y *Banco de alimentos* con sus configuraciones y membresías, buscando a los usuarios por correo.

### 5.6 Límites del plan Free a tener en cuenta
- Se **pausa tras 7 días sin actividad**: reactivar desde el dashboard (los datos se conservan).
- Máximo 2 proyectos activos por organización gratuita.
- Usar un solo proyecto para desarrollo y la prueba del 2–4 dic.

**Criterios de aceptación:**
- `SETUP02-CA01`: Las 10 tablas existen con nombres exactos de `docs/database.md` y RLS habilitado en todas.
- `SETUP02-CA02`: `SHOW timezone;` devuelve `America/El_Salvador`.
- `SETUP02-CA03`: Registrarse en Auth crea automáticamente la fila en `public.usuarios`; crear un grupo agrega al creador como `responsable`.
- `SETUP02-CA04`: Desde Android con la `anon key`, un usuario sin membresía **no** ve grupos ajenos (RLS comprobada).
- `SETUP02-CA05`: El repo contiene `supabase/migrations/`, `supabase/seed.sql` y `.env.example`, y **no** contiene `.env` ni `service_role`.

---

<a id="setup-03"></a>

## 6. `[SETUP-03]` · Push Android: Firebase FCM v1 + Development Build *(Media · antes de `HU16`)*

Se hace **al entrar a `MVP · Media`**, no antes (`ADR-004`). Deja la infraestructura lista y probada con un push de prueba; la lógica de eventos, la bandeja y el registro de tokens por usuario son de `[HU16]`.

### 6.1 Firebase (solo credenciales, sin usar otros servicios)
1. https://console.firebase.google.com → **Crear proyecto** `registro-actividades-udb` (plan **Spark**, sin tarjeta; Analytics desactivado).
2. **Agregar app Android** con el paquete exacto de `app.json` (`sv.udb.registroactividades`) → descargar `google-services.json`.
3. *Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada* → archivo JSON de la **cuenta de servicio** (es secreto: **nunca** al repo).

### 6.2 Expo / EAS
1. Crear cuenta gratuita en https://expo.dev, `npm i -g eas-cli`, `eas login` y `eas init` (agrega `extra.eas.projectId` a la config; lo usa `getExpoPushTokenAsync`).
2. Subir la clave de cuenta de servicio a Expo: `eas credentials` → *Android* → *Google Service Account* → **FCM V1**.
3. `google-services.json` sigue ignorado por git: se pasa a EAS como variable de tipo archivo (`eas env:create --name GOOGLE_SERVICES_JSON --type file`) y `app.config.ts` usa `android.googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json'`.
4. `npx expo install expo-dev-client expo-notifications expo-device` y configurar el plugin `expo-notifications` (canal Android por defecto).
5. Compilar el **Development Build**: `eas build --profile development --platform android` (cola gratuita en la nube) o `npx expo run:android` con Android SDK local. Instalar el APK en los teléfonos del equipo.

### 6.3 Supabase (envío desde el servidor)
1. Crear la Edge Function `enviar-push` (`npx supabase functions new enviar-push`): recibe la fila insertada en `notificaciones`, busca los `tokens_push` activos de `usuario_id` y llama a `https://exp.host/--/api/v2/push/send`.
2. La función corre **dentro de Supabase**: ahí sí puede usar la llave de servidor que Supabase le inyecta (nunca en la app, `RNF03`).
3. `npx supabase functions deploy enviar-push` y crear el **Database Webhook** *INSERT en `notificaciones` → `enviar-push`* (*Database → Webhooks*).

### 6.4 Límites y riesgos
- La cola gratuita de EAS Build puede tardar; compilar el Dev Build **el primer día de Media**.
- El push **no funciona en Expo Go**; la bandeja in-app sí (`ADR-004`).

**Criterios de aceptación:**
- `SETUP03-CA01`: El Development Build se instala en Android y abre la app con el paquete `sv.udb.registroactividades`.
- `SETUP03-CA02`: La app obtiene un `ExponentPushToken[...]` tras conceder permiso, y un push de prueba enviado desde https://expo.dev/notifications llega al teléfono.
- `SETUP03-CA03`: Insertar manualmente una fila en `notificaciones` (SQL Editor) para un usuario con token dispara `enviar-push` y llega el push.
- `SETUP03-CA04`: El repo no contiene `google-services.json`, la clave de la cuenta de servicio ni llaves de servidor de Supabase.
