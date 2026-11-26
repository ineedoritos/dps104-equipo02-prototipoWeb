import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import {
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  registrarAsistenciaQR,
} from '@/lib/gruposStore';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

type EstadoCamara = 'activa' | 'sin_permiso' | 'procesando' | 'error_qr';

export default function EscanearQRScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [estadoCamara, setEstadoCamara] = useState<EstadoCamara>('activa');
  const [mensajeError, setMensajeError] = useState('');
  const [bloqueado, setBloqueado] = useState(false);

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;

  if (!grupo || !jornada || !rol) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Escanear código QR" />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                icono="inicio"
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

  const procesarLectura = (codigo: 'VALIDO' | 'EXPIRADO' | 'REVOCADO' | 'INVALIDO') => {
    if (bloqueado) {
      return;
    }

    setBloqueado(true);
    setEstadoCamara('procesando');
    setMensajeError('');

    setTimeout(() => {
      try {
        const resultado = registrarAsistenciaQR(jornada.id, codigo);
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
        setEstadoCamara('error_qr');
        if (err instanceof ErrorDominio) {
          setMensajeError(err.message);
        } else {
          setMensajeError('No pudimos validar el código leído. Intenta de nuevo.');
        }
        setBloqueado(false);
      }
    }, 250);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior
        accessibilityLabelVolver="Volver al grupo"
        titulo={jornada.titulo}
      />

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

                {estadoCamara === 'procesando' ? (
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
                cargando={estadoCamara === 'procesando'}
                deshabilitado={bloqueado}
                icono="hecho"
                onPress={() => procesarLectura('VALIDO')}
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
    fontWeight: pesos.fuerte,
  },
  subtituloBarra: {
    color: colores.tintaSuave,
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
    fontWeight: pesos.medio,
    textAlign: 'center',
  },
  tarjetaPermiso: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
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
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  descripcionPermiso: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
  notaManual: {
    color: colores.tintaSuave,
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
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  textoChipPrueba: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
});
