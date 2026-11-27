import { Encabezado } from '@/components/ui/Encabezado';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { HojaAcciones } from '@/components/ui/HojaAcciones';
import { Icono } from '@/components/ui/Icono';
import {
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  registrarAsistenciaQR,
} from '@/lib/gruposStore';
import { colores, espaciados, forma, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import { type CasoUbicacionSimulada, obtenerUbicacionActual } from '@/lib/ubicacionSimulada';
import { ErrorDominio } from '@/types/dominio';

type EstadoCamara =
  | 'activa'
  | 'sin_permiso'
  | 'procesando'
  | 'comprobando_gps'
  | 'sin_permiso_gps'
  | 'error_gps'
  | 'error_qr';

interface ErrorUbicacion {
  titulo: string;
  texto: string;
}

export default function EscanearQRScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [estadoCamara, setEstadoCamara] = useState<EstadoCamara>('activa');
  const [mensajeError, setMensajeError] = useState('');
  const [errorGps, setErrorGps] = useState<ErrorUbicacion | null>(null);
  const [hojaGpsAbierta, setHojaGpsAbierta] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;

  if (!grupo || !jornada || !rol) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <Encabezado onVolver={() => router.back()} titulo="Escanear código QR" />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.replace('/(tabs)')}
                tamano="sm"
                titulo="Ir a Mis grupos"
                variante="secundario"
              />
            }
            texto="No tienes acceso a esta jornada o ya no perteneces al grupo."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const estadoJornada = derivarEstadoJornada(jornada);
  const puedeEscanear =
    jornada.modalidad_asistencia === 'qr' && !jornada.cancelada && estadoJornada === 'en_curso';

  const procesarLectura = (
    codigo: 'VALIDO' | 'EXPIRADO' | 'REVOCADO' | 'INVALIDO',
    casoGps?: CasoUbicacionSimulada,
  ) => {
    if (bloqueado) {
      return;
    }

    setBloqueado(true);
    setMensajeError('');
    setErrorGps(null);

    const ejecutarRegistro = async () => {
      try {
        let ubicacionLectura;
        if (jornada.gps_habilitado && codigo === 'VALIDO') {
          setEstadoCamara('comprobando_gps');
          const referencia =
            jornada.ref_latitud != null && jornada.ref_longitud != null
              ? { latitud: jornada.ref_latitud, longitud: jornada.ref_longitud }
              : null;
          const resultadoUbicacion = await obtenerUbicacionActual(
            casoGps ?? 'dentro_radio',
            referencia,
          );
          if (resultadoUbicacion === 'sin_permiso') {
            setEstadoCamara('sin_permiso_gps');
            setErrorGps({
              titulo: 'Necesitamos tu ubicación para registrar tu asistencia.',
              texto: 'Actívala en los ajustes del teléfono.',
            });
            setBloqueado(false);
            return;
          }
          ubicacionLectura = resultadoUbicacion;
        }

        setEstadoCamara('procesando');
        const resultado = registrarAsistenciaQR(jornada.id, codigo, ubicacionLectura);
        router.replace({
          pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/confirmacion-qr',
          params: {
            grupoId: grupo.id,
            jornadaId: jornada.id,
            tipo: resultado.tipo,
            horaTexto: resultado.horaTexto,
            duracionMinutos:
              resultado.duracionMinutos !== null ? String(resultado.duracionMinutos) : '',
          },
        });
      } catch (err) {
        if (err instanceof ErrorDominio && err.codigo === 'ERR_GPS_FUERA_DE_RADIO') {
          setEstadoCamara('error_gps');
          setErrorGps({
            titulo: 'Estás lejos del lugar de la jornada.',
            texto: 'Acércate al punto de encuentro e intenta de nuevo.',
          });
        } else if (err instanceof ErrorDominio && err.codigo === 'ERR_GPS_SIN_PRECISION') {
          setEstadoCamara('error_gps');
          setErrorGps({
            titulo: 'No pudimos ubicarte con precisión.',
            texto: 'Sal a un lugar abierto y vuelve a intentar.',
          });
        } else {
          setEstadoCamara('error_qr');
          setMensajeError(
            err instanceof ErrorDominio
              ? err.message
              : 'No pudimos validar el código leído. Intenta de nuevo.',
          );
        }
        setBloqueado(false);
      }
    };

    setTimeout(() => {
      void ejecutarRegistro();
    }, 250);
  };

  const iniciarLecturaPrincipal = () => {
    if (jornada.gps_habilitado) {
      if (__DEV__) {
        setHojaGpsAbierta(true);
      } else {
        procesarLectura('VALIDO', 'dentro_radio');
      }
      return;
    }
    procesarLectura('VALIDO');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado onVolver={() => router.back()} titulo="Escanear código QR" />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {!puedeEscanear ? (
          <Aviso
            accion={
              <Boton
                onPress={() => router.back()}
                tamano="sm"
                titulo="Volver al grupo"
                variante="secundario"
              />
            }
            texto={
              jornada.cancelada
                ? 'Esta jornada fue cancelada y no admite escaneos.'
                : jornada.modalidad_asistencia !== 'qr'
                  ? 'Esta jornada usa asistencia manual; el responsable registrará tu asistencia.'
                  : 'El escaneo de código QR solo está disponible mientras la jornada está en curso.'
            }
            tipo="error"
          />
        ) : null}

        {puedeEscanear && estadoCamara === 'sin_permiso' ? (
          <View style={styles.tarjetaPermiso}>
            <View style={styles.circuloIcono}>
              <Icono color={colores.acento} nombre="camara" tamano={28} />
            </View>
            <Text style={styles.tituloPermiso}>Necesitamos acceso a tu cámara</Text>
            <Text style={styles.descripcionPermiso}>
              Habilita el permiso de cámara en la configuración de tu dispositivo para leer el
              código que muestra el responsable.
            </Text>
            <Boton
              icono="camara"
              onPress={() => {
                setMensajeError('');
                setEstadoCamara('activa');
              }}
              titulo="Solicitar permiso de nuevo"
            />
            <Text style={styles.notaManual}>
              Sin permiso de cámara o fuera de rango: el responsable puede registrarte manualmente.
            </Text>
          </View>
        ) : null}

        {puedeEscanear && estadoCamara !== 'sin_permiso' ? (
          <>
            <View style={styles.visor}>
              <View style={styles.marcoVisor}>
                <View style={[styles.esquina, styles.esquinaSupIzq]} />
                <View style={[styles.esquina, styles.esquinaSupDer]} />
                <View style={[styles.esquina, styles.esquinaInfIzq]} />
                <View style={[styles.esquina, styles.esquinaInfDer]} />

                {estadoCamara === 'comprobando_gps' ? (
                  <View style={styles.centroVisor}>
                    <ActivityIndicator color={colores.superficie} size="large" />
                    <Text style={styles.textoVisor}>Comprobando tu ubicación…</Text>
                  </View>
                ) : estadoCamara === 'procesando' ? (
                  <View style={styles.centroVisor}>
                    <ActivityIndicator color={colores.superficie} size="large" />
                    <Text style={styles.textoVisor}>Verificando código…</Text>
                  </View>
                ) : (
                  <View style={styles.centroVisor}>
                    <Icono color={colores.superficie} nombre="camara" tamano={36} />
                    <Text style={styles.textoVisor}>Apunta al código del responsable</Text>
                  </View>
                )}
              </View>
            </View>

            {jornada.control_horas ? (
              <Aviso
                texto="La app detecta automáticamente si registras tu entrada o tu salida."
                tipo="info"
              />
            ) : null}

            {(estadoCamara === 'error_gps' || estadoCamara === 'sin_permiso_gps') && errorGps ? (
              <View style={styles.tarjetaGpsError}>
                <View style={styles.encabezadoGpsError}>
                  <Icono color={forma.roseInk} nombre="lugar" tamano={20} />
                  <Text style={styles.tituloGpsError}>{errorGps.titulo}</Text>
                </View>
                <Text style={styles.textoGpsError}>{errorGps.texto}</Text>
                <Text style={styles.notaGpsManual}>
                  Si no puedes, pide al responsable que registre tu asistencia.
                </Text>
                <Boton
                  onPress={iniciarLecturaPrincipal}
                  tamano="sm"
                  titulo="Reintentar"
                  variante="secundario"
                />
              </View>
            ) : null}

            {estadoCamara === 'error_qr' && mensajeError ? (
              <Aviso
                accion={
                  <Boton
                    onPress={() => {
                      setMensajeError('');
                      setEstadoCamara('activa');
                    }}
                    tamano="sm"
                    titulo="Volver a escanear"
                    variante="secundario"
                  />
                }
                texto={mensajeError}
                tipo="error"
              />
            ) : null}

            <View style={styles.bloqueAcciones}>
              <Boton
                cargando={estadoCamara === 'procesando' || estadoCamara === 'comprobando_gps'}
                deshabilitado={bloqueado}
                icono="hecho"
                onPress={iniciarLecturaPrincipal}
                titulo="Registrar lectura del código"
              />

              {__DEV__ ? (
                <View style={styles.barraPruebas}>
                  <Pressable
                    onPress={() => setEstadoCamara('sin_permiso')}
                    style={styles.chipPrueba}
                  >
                    <Text style={styles.textoChipPrueba}>Simular sin permiso</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => procesarLectura('EXPIRADO')}
                    style={styles.chipPrueba}
                  >
                    <Text style={styles.textoChipPrueba}>Simular código vencido</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => procesarLectura('REVOCADO')}
                    style={styles.chipPrueba}
                  >
                    <Text style={styles.textoChipPrueba}>Simular código revocado</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <Text style={styles.notaPie}>
          Sin permiso de cámara o fuera de rango: el responsable puede registrarte manualmente.
        </Text>
      </ScrollView>

      <HojaAcciones
        acciones={[
          {
            etiqueta: 'Dentro del radio',
            icono: 'hecho',
            onPress: () => procesarLectura('VALIDO', 'dentro_radio'),
          },
          {
            etiqueta: 'Fuera del radio (350 m)',
            icono: 'lugar',
            peligro: true,
            onPress: () => procesarLectura('VALIDO', 'fuera_radio'),
          },
          {
            etiqueta: 'Poca precisión (120 m)',
            icono: 'alerta',
            peligro: true,
            onPress: () => procesarLectura('VALIDO', 'poca_precision'),
          },
          {
            etiqueta: 'Sin permiso',
            icono: 'cerrar',
            peligro: true,
            onPress: () => procesarLectura('VALIDO', 'sin_permiso'),
          },
        ]}
        onCerrar={() => setHojaGpsAbierta(false)}
        visible={hojaGpsAbierta}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  barraSuperior: {
    alignItems: 'center',
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  botonIcono: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  centroBarra: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: espaciados.sm,
  },
  tituloBarra: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  subtituloBarra: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  espacioDerecha: {
    width: 40,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  visor: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colores.tinta,
    borderRadius: radios.tarjeta,
    justifyContent: 'center',
    padding: espaciados.xl,
  },
  marcoVisor: {
    alignItems: 'center',
    height: '78%',
    justifyContent: 'center',
    position: 'relative',
    width: '78%',
  },
  esquina: {
    borderColor: colores.superficie,
    height: 28,
    position: 'absolute',
    width: 28,
  },
  esquinaSupIzq: {
    borderLeftWidth: 3,
    borderTopLeftRadius: radios.sm,
    borderTopWidth: 3,
    left: 0,
    top: 0,
  },
  esquinaSupDer: {
    borderRightWidth: 3,
    borderTopRightRadius: radios.sm,
    borderTopWidth: 3,
    right: 0,
    top: 0,
  },
  esquinaInfIzq: {
    borderBottomLeftRadius: radios.sm,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    bottom: 0,
    left: 0,
  },
  esquinaInfDer: {
    borderBottomRightRadius: radios.sm,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    bottom: 0,
    right: 0,
  },
  centroVisor: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingHorizontal: espaciados.md,
  },
  textoVisor: {
    color: colores.superficie,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.medio,
    textAlign: 'center',
  },
  tarjetaPermiso: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.xl,
  },
  circuloIcono: {
    alignItems: 'center',
    backgroundColor: colores.acentoSuave,
    borderRadius: radios.pill,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  tituloPermiso: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
    textAlign: 'center',
  },
  descripcionPermiso: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
  notaManual: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    textAlign: 'center',
  },
  bloqueAcciones: {
    gap: espaciados.md,
  },
  barraPruebas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  chipPrueba: {
    backgroundColor: colores.superficie,
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  textoChipPrueba: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontFamily: fuentes.medio,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
  tarjetaGpsError: {
    backgroundColor: forma.rose,
    borderRadius: radios.superficie,
    gap: espaciados.sm,
    padding: espaciados.tonal,
  },
  encabezadoGpsError: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  tituloGpsError: {
    color: forma.roseInk,
    flex: 1,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpoSm,
  },
  textoGpsError: {
    color: forma.roseInk,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  notaGpsManual: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
});
