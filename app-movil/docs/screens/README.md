# Inventario de pantallas y mapa de navegación (`RNF01`)

Basado 1 a 1 en las 17 pantallas de `docs/artifacts/Wireflow de Registro de actividades (1).html` más la pantalla 18 de Notificaciones (`HU16` · Media).
Navegación con **Expo Router** combinando **pila (Stack) + pestañas (Tabs)** según `ADR-001`.

## Árbol de rutas sugerido (Expo Router)
```text
app/
├── (auth)/
│   └── login.tsx                                  # SCREEN-01 (Iniciar sesión + Crear cuenta)
├── (tabs)/
│   ├── _layout.tsx                                # Pestañas: Mis grupos | Mi historial | Notificaciones (Media) | Cuenta
│   ├── index.tsx                                  # SCREEN-02 (Mis grupos)
│   ├── historial.tsx                              # SCREEN-16 (Mi historial global / por grupo)
│   ├── notificaciones.tsx                         # SCREEN-18 (Notificaciones · Media)
│   └── cuenta.tsx                                 # Cuenta: perfil básico y Cerrar sesión (HU01 CA03)
└── grupos/
    ├── crear.tsx                                  # SCREEN-03 (Crear grupo)
    └── [grupoId]/
        ├── index.tsx                              # Redirige o renderiza SCREEN-04 (responsable) o SCREEN-13 (participante)
        ├── configuracion.tsx                      # SCREEN-05 (Configuración)
        ├── integrantes.tsx                        # SCREEN-06 (Integrantes)
        ├── reportes.tsx                           # SCREEN-12 (Reportes)
        └── jornadas/
            ├── crear.tsx                          # SCREEN-07 (Crear / editar jornada)
            └── [jornadaId]/
                ├── index.tsx                      # SCREEN-08 (Detalle de jornada)
                ├── asistencia.tsx                 # SCREEN-09 (Asistencia y correcciones)
                ├── ajustar-horas.tsx              # SCREEN-10 (Ajustar horas)
                ├── mostrar-qr.tsx                 # SCREEN-11 (Mostrar QR)
                ├── escanear-qr.tsx                # SCREEN-14 (Escanear QR)
                ├── confirmacion-qr.tsx            # SCREEN-15 (Entrada/Salida registrada)
                └── mi-registro.tsx                # SCREEN-17 (Detalle del registro)
```

> **Estado de la demo de `[SETUP-01]`:** la app abre directo en el tablero de **Inicio** (basado en `prototipo-web`, con datos mock en `data/`) y el navbar muestra solo **Inicio** y **Cuenta**. Las rutas de `SCREEN-02` en adelante se incorporan en sus historias de usuario.

## Índice maestro de pantallas

| # | Archivo | Título en Wireflow | Rol | Prioridad | Spec / HU |
|---|---|---|---|---|---|
| 01 | `SCREEN-01-INICIAR-SESION.md` | 01 Iniciar sesión (+ Crear cuenta) | Público | Alta | `HU01` |
| 02 | `SCREEN-02-MIS-GRUPOS.md` | 02 Mis grupos | Todos | Alta | `HU02` |
| 03 | `SCREEN-03-CREAR-GRUPO.md` | 03 Crear grupo | Todos | Alta | `HU02` |
| 04 | `SCREEN-04-GRUPO-RESPONSABLE.md` | 04 Grupo, vista responsable | Responsable | Alta | `HU06` |
| 05 | `SCREEN-05-CONFIGURACION.md` | 05 Configuración | Responsable | Alta (+flags Media) | `HU04` |
| 06 | `SCREEN-06-INTEGRANTES.md` | 06 Integrantes | Responsable | Alta | `HU03` |
| 07 | `SCREEN-07-CREAR-JORNADA.md` | 07 Crear actividad (`jornada`) | Responsable | Alta (+GPS Media) | `HU05`, `HU11` |
| 08 | `SCREEN-08-DETALLE-JORNADA.md` | 08 Detalle de actividad (`jornada`) | Responsable | Alta (+Fotos Media) | `HU05`, `HU06`, `HU10` |
| 09 | `SCREEN-09-ASISTENCIA-MANUAL.md` | 09 Asistencia y correcciones | Responsable | Alta (+Valid. Media) | `HU07`, `HU12` |
| 10 | `SCREEN-10-AJUSTAR-HORAS.md` | 10 Ajustar horas | Responsable | Alta | `HU09` |
| 11 | `SCREEN-11-MOSTRAR-QR.md` | 11 Mostrar QR | Responsable | Alta | `HU08` |
| 12 | `SCREEN-12-REPORTES.md` | 12 Reportes | Responsable | Alta | `HU15` |
| 13 | `SCREEN-13-GRUPO-PARTICIPANTE.md` | 13 Grupo, vista participante | Participante | Alta | `HU06` |
| 14 | `SCREEN-14-ESCANEAR-QR.md` | 14 Escanear QR | Participante | Alta (+GPS Media) | `HU08`, `HU11` |
| 15 | `SCREEN-15-ENTRADA-REGISTRADA.md` | 15 Entrada registrada | Participante | Alta | `HU08`, `HU09` |
| 16 | `SCREEN-16-MI-HISTORIAL.md` | 16 Mi historial | Integrante | Alta | `HU14` |
| 17 | `SCREEN-17-DETALLE-REGISTRO.md` | 17 Detalle del registro | Participante | Alta (+Rev. Media) | `HU14`, `HU13` |
| 18 | `SCREEN-18-NOTIFICACIONES.md` | Notificaciones *(extra Media)* | Todos | Media | `HU16` |
