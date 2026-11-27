import { Encabezado } from '@/components/ui/Encabezado';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { ESTADO_ASISTENCIA, Estado } from '@/components/ui/Estado';
import { GaleriaFotos } from '@/components/ui/GaleriaFotos';
import { HojaAcciones } from '@/components/ui/HojaAcciones';
import { Seccion } from '@/components/ui/Seccion';
import { formatearDia, formatearDuracion, formatearFecha, horaEnZona } from '@/lib/fecha';
import {
  agregarFotoSimulada,
  obtenerFotosDeJornada,
  suscribirFotos,
  tengoFotoEnJornada,
} from '@/lib/fotosStore';
import {
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiAsistenciaEnJornada,
  obtenerMiRolEnGrupo,
  obtenerResponsableDeGrupo,
  obtenerSesionActual,
  suscribirStore,
} from '@/lib/gruposStore';
import {
  crearSolicitudRevision,
  obtenerMiSolicitud,
  suscribirRevisiones,
} from '@/lib/revisionesStore';
import {
  cifrasTabulares,
  colores,
  espaciados,
  forma,
  fuentes,
  interletrado,
  radios,
  tipografia,
} from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

function formatearHoraCorta(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return horaEnZona(iso).slice(0, 5);
}

export default function DetalleRegistroScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [tick, setTick] = useState(0);
  const [modalRevision, setModalRevision] = useState(false);
  const [motivoSolicitud, setMotivoSolicitud] = useState('');
  const [errorMotivo, setErrorMotivo] = useState('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [hojaCamaraAbierta, setHojaCamaraAbierta] = useState(false);
  const [errorFoto, setErrorFoto] = useState<'permiso' | 'subida' | null>(null);
  const [mensajeFoto, setMensajeFoto] = useState('');

  const recargar = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
      const desuscribirStore = suscribirStore(recargar);
      const desuscribirRev = suscribirRevisiones(recargar);
      const desuscribirFotos = suscribirFotos(recargar);
      return () => {
        desuscribirStore();
        desuscribirRev();
        desuscribirFotos();
      };
    }, [recargar]),
  );

  void tick;
  const sesion = obtenerSesionActual();
  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;
  const asistencia = jornadaId ? obtenerMiAsistenciaEnJornada(jornadaId) : undefined;
  const miSolicitud = jornadaId ? obtenerMiSolicitud(jornadaId) : undefined;
  const responsable = grupoId ? obtenerResponsableDeGrupo(grupoId) : undefined;
  const fotos = jornadaId ? obtenerFotosDeJornada(jornadaId).filter((foto) => foto.autor_id === sesion?.id) : [];
  const tengoFoto = jornadaId ? tengoFotoEnJornada(jornadaId) : false;

  if (!sesion || !grupo || !jornada) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <Encabezado onVolver={() => router.back()} titulo="Detalle del registro" />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.replace('/(tabs)/historial')}
                tamano="sm"
                titulo="Ir a Mi historial"
                variante="secundario"
              />
            }
            texto="No tienes permiso para ver este registro o la jornada no está disponible."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const fechaTexto = formatearDia(jornada.inicio_en.slice(0, 10), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const metaEstado = asistencia ? ESTADO_ASISTENCIA[asistencia.estado] : null;
  const huboAjuste =
    Boolean(asistencia) &&
    jornada.control_horas &&
    asistencia?.estado === 'presente' &&
    asistencia.duracion_minutos !== null &&
    asistencia.minutos_reconocidos !== null &&
    asistencia.minutos_reconocidos < asistencia.duracion_minutos;

  const puedeSolicitarRevision =
    !jornada.cancelada &&
    rol === 'participante' &&
    (!miSolicitud || miSolicitud.estado !== 'pendiente');

  const abrirModalRevision = () => {
    setMotivoSolicitud('');
    setErrorMotivo('');
    setModalRevision(true);
  };

  const manejarEnviarSolicitud = () => {
    const limpio = motivoSolicitud.trim();
    if (!limpio) {
      setErrorMotivo('Escribe qué hay que revisar.');
      return;
    }
    if (limpio.length < 10) {
      setErrorMotivo('Describe qué hay que revisar con al menos 10 caracteres.');
      return;
    }

    setErrorMotivo('');
    setEnviandoSolicitud(true);
    try {
      crearSolicitudRevision(jornada.id, limpio);
      setModalRevision(false);
      setMotivoSolicitud('');
      recargar();
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorMotivo(error.message);
      } else {
        setErrorMotivo('No pudimos enviar tu solicitud. Intenta de nuevo.');
      }
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const estadoJornada = derivarEstadoJornada(jornada);
  const puedeAgregarFoto =
    Boolean(rol) && !jornada.cancelada && estadoJornada !== 'programada';
  const motivoBloqueoFoto = jornada.cancelada
    ? 'Las jornadas canceladas no admiten nuevas fotos.'
    : estadoJornada === 'programada'
      ? 'Podrás agregar fotos cuando la jornada inicie.'
      : !rol
        ? 'Ya no perteneces activamente a este grupo.'
        : undefined;
  const faltaFotoObligatoria =
    jornada.modo_fotos === 'obligatorias' && !jornada.cancelada && !tengoFoto;

  const tomarFoto = () => {
    setErrorFoto(null);
    setMensajeFoto('');
    try {
      agregarFotoSimulada(jornada.id);
      recargar();
    } catch (error) {
      setErrorFoto('subida');
      setMensajeFoto(
        error instanceof ErrorDominio
          ? error.message
          : 'No pudimos guardar la foto. Intenta de nuevo.',
      );
    }
  };

  const solicitarAgregarFoto = () => {
    if (__DEV__) {
      setHojaCamaraAbierta(true);
    } else {
      tomarFoto();
    }
  };

  const manejarAbrirAjustes = () => {
    Linking.openSettings().catch(() => {
      setMensajeFoto('Abre los ajustes del teléfono para conceder el permiso de cámara.');
    });
  };
  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado onVolver={() => router.back()} titulo="Detalle del registro" />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>

        {estadoVista === 'cargando' ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator color={colores.acento} size="large" />
            <Text style={styles.textoCarga}>Cargando detalle…</Text>
          </View>
        ) : null}

        {estadoVista === 'error' ? (
          <Aviso
            accion={
              <Boton
                onPress={() => {
                  setEstadoVista('normal');
                  recargar();
                }}
                tamano="sm"
                titulo="Reintentar"
                variante="secundario"
              />
            }
            texto="No pudimos cargar el detalle de tu registro. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista === 'normal' ? (
          <>
            <View style={styles.tarjetaCabecera}>
              <View style={styles.filaTitulo}>
                <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
                {metaEstado ? (
                  <Estado etiqueta={metaEstado.etiqueta} tono={metaEstado.tono} />
                ) : (
                  <Estado etiqueta="Sin registro" tono="sinRegistro" />
                )}
              </View>
              <Text style={styles.metaGrupo}>{grupo.nombre}</Text>
              <Text style={styles.metaFecha}>{fechaTexto}</Text>
              {jornada.requiere_validacion ? (
                asistencia ? (
                  <View style={styles.filaValidacion}>
                    <Estado
                      tono={
                        asistencia.estado_validacion === 'aprobado'
                          ? 'aprobadoValidacion'
                          : 'pendienteValidacion'
                      }
                    />
                    <Text style={styles.textoValidacion}>
                      {asistencia.estado_validacion === 'aprobado'
                        ? 'Este registro fue aprobado y cuenta en tus totales.'
                        : 'Tus horas cuentan cuando el responsable las apruebe.'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.textoValidacion}>
                    Esta jornada exige validación previa del responsable.
                  </Text>
                )
              ) : (
                <Text style={styles.textoValidacion}>Esta jornada no exige validación previa.</Text>
              )}
            </View>

            {jornada.cancelada ? (
              <Aviso
                texto="Esta jornada fue cancelada. Sus registros no cuentan en tus totales."
                tipo="error"
              />
            ) : null}

            {!asistencia ? (
              <Aviso
                texto="Aún no hay un registro de asistencia para ti en esta jornada."
                tipo="info"
              />
            ) : null}

            {asistencia && jornada.control_horas && asistencia.estado === 'presente' ? (
              <Seccion titulo="Tiempo registrado">
                <View style={styles.tarjetaDatos}>
                  <View style={styles.filaDato}>
                    <Text style={styles.etiquetaDato}>Entrada</Text>
                    <Text style={[styles.valorDato, cifrasTabulares]}>
                      {formatearHoraCorta(asistencia.hora_entrada)}
                    </Text>
                  </View>
                  <View style={styles.divisor} />
                  <View style={styles.filaDato}>
                    <Text style={styles.etiquetaDato}>Salida</Text>
                    <Text style={[styles.valorDato, cifrasTabulares]}>
                      {formatearHoraCorta(asistencia.hora_salida)}
                    </Text>
                  </View>
                  <View style={styles.divisor} />
                  <View style={styles.filaDato}>
                    <Text style={styles.etiquetaDato}>Duración registrada</Text>
                    <Text style={[styles.valorDato, cifrasTabulares]}>
                      {formatearDuracion(asistencia.duracion_minutos)}
                    </Text>
                  </View>
                  <View style={styles.divisor} />
                  <View style={styles.filaDato}>
                    <Text style={styles.etiquetaDato}>Tiempo reconocido</Text>
                    <Text style={[styles.valorDato, cifrasTabulares]}>
                      {formatearDuracion(
                        asistencia.minutos_reconocidos ?? asistencia.duracion_minutos,
                      )}
                    </Text>
                  </View>
                </View>
              </Seccion>
            ) : null}

            {huboAjuste && asistencia?.motivo_ajuste ? (
              <View style={styles.tarjetaMotivo}>
                <Text style={styles.tituloMotivo}>
                  Motivo del ajuste, escrito por el responsable
                </Text>
                <Text style={styles.textoMotivo}>{asistencia.motivo_ajuste}</Text>
              </View>
            ) : null}

            {asistencia?.estado === 'justificada' && asistencia.motivo_ausencia ? (
              <View style={styles.tarjetaMotivo}>
                <Text style={styles.tituloMotivo}>Motivo de ausencia justificada</Text>
                <Text style={styles.textoMotivo}>{asistencia.motivo_ausencia}</Text>
              </View>
            ) : null}

            {rol === 'participante' && jornada.modo_fotos !== 'no_permitidas' ? (
              <Seccion titulo="Fotos de la jornada">
                {faltaFotoObligatoria ? (
                  <Aviso
                    texto="Esta jornada pide al menos una foto para completar tu asistencia."
                    tipo="info"
                  />
                ) : null}

                {errorFoto === 'permiso' ? (
                  <Aviso
                    accion={
                      <View style={styles.filaBotonesFoto}>
                        <Boton
                          onPress={solicitarAgregarFoto}
                          tamano="sm"
                          titulo="Reintentar"
                          variante="secundario"
                        />
                        <Boton
                          onPress={manejarAbrirAjustes}
                          tamano="sm"
                          titulo="Abrir ajustes"
                          variante="fantasma"
                        />
                      </View>
                    }
                    texto={
                      mensajeFoto ||
                      'Necesitamos acceso a tu cámara para tomar la foto de evidencia.'
                    }
                    tipo="error"
                  />
                ) : null}

                {errorFoto === 'subida' ? (
                  <Aviso
                    accion={
                      <Boton
                        onPress={solicitarAgregarFoto}
                        tamano="sm"
                        titulo="Reintentar"
                        variante="secundario"
                      />
                    }
                    texto={mensajeFoto || 'No pudimos subir la foto. Intenta de nuevo.'}
                    tipo="error"
                  />
                ) : null}

                <GaleriaFotos
                  esResponsable={false}
                  fotos={fotos}
                  motivoBloqueoAgregar={motivoBloqueoFoto}
                  onAgregarFoto={solicitarAgregarFoto}
                  puedeAgregar={puedeAgregarFoto}
                />
              </Seccion>
            ) : null}

            {!jornada.cancelada || miSolicitud ? (
              <Seccion titulo="Revisión">
                {miSolicitud ? (
                  <View style={styles.tarjetaRevision}>
                    <View style={styles.filaEstadoRevision}>
                      <Estado tono={miSolicitud.estado} />
                      <Text style={[styles.fechaRevision, cifrasTabulares]}>
                        {formatearFecha(miSolicitud.creado_en, {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        · {horaEnZona(miSolicitud.creado_en).slice(0, 5)}
                      </Text>
                    </View>
                    <Text style={styles.textoMotivo}>{miSolicitud.motivo_solicitud}</Text>
                    {miSolicitud.motivo_resolucion ? (
                      <View style={styles.cajaResolucion}>
                        <Text style={styles.etiquetaResolucion}>Respuesta del responsable</Text>
                        <Text style={styles.textoResolucion}>
                          {miSolicitud.motivo_resolucion}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.bloqueDuda}>
                    <Text style={styles.tituloDuda}>¿Algo no está bien en tu registro?</Text>
                    <Text style={styles.textoDuda}>
                      Si falta una marca o tus horas no coinciden, envía una solicitud de revisión
                      {responsable ? ` a ${responsable.nombre}` : ''}.
                    </Text>
                  </View>
                )}

                {puedeSolicitarRevision ? (
                  <Boton
                    onPress={abrirModalRevision}
                    titulo="Solicitar revisión"
                    variante="secundario"
                  />
                ) : null}
              </Seccion>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setModalRevision(false)}
        transparent
        visible={modalRevision}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.veloModal}
        >
          <ScrollView style={styles.marcoModal} contentContainerStyle={styles.tarjetaModal} keyboardShouldPersistTaps="handled">
            <Text style={styles.tituloModal}>Solicitar revisión</Text>
            <Text style={styles.cuerpoModal}>
              Explica qué hay que revisar en tu asistencia u horas. Tu registro no cambia hasta que
              el responsable lo revise.
            </Text>
            <CampoTexto
              error={errorMotivo || undefined}
              etiqueta="Motivo"
              maxLength={500}
              multilinea
              numberOfLines={4}
              onChangeText={(texto) => {
                setMotivoSolicitud(texto);
                if (errorMotivo) {
                  setErrorMotivo('');
                }
              }}
              placeholder="Ej. Llegué a tiempo pero no aparece mi entrada."
              value={motivoSolicitud}
            />
            <View style={styles.botonesModal}>
              <View style={styles.colBotonModal}>
                <Boton
                  deshabilitado={enviandoSolicitud}
                  onPress={() => setModalRevision(false)}
                  titulo="Cancelar"
                  variante="secundario"
                />
              </View>
              <View style={styles.colBotonModal}>
                <Boton
                  cargando={enviandoSolicitud}
                  onPress={manejarEnviarSolicitud}
                  titulo="Enviar solicitud"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <HojaAcciones
        acciones={[
          {
            etiqueta: 'Tomar foto',
            icono: 'camara',
            onPress: tomarFoto,
          },
          {
            etiqueta: 'Permiso denegado',
            icono: 'alerta',
            peligro: true,
            onPress: () => {
              setErrorFoto('permiso');
              setMensajeFoto(
                'Necesitamos acceso a tu cámara para tomar la foto de evidencia.',
              );
            },
          },
          {
            etiqueta: 'Error al subir',
            icono: 'cerrar',
            peligro: true,
            onPress: () => {
              setErrorFoto('subida');
              setMensajeFoto('No pudimos subir la foto. Revisa tu conexión e intenta de nuevo.');
            },
          },
        ]}
        onCerrar={() => setHojaCamaraAbierta(false)}
        visible={hojaCamaraAbierta}
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
  tituloBarra: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  espacioDerecha: {
    width: 40,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  tarjetaCabecera: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  filaTitulo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  tituloJornada: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  metaGrupo: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.medio,
  },
  metaFecha: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  filaValidacion: {
    borderTopColor: forma.line,
    borderTopWidth: 1,
    gap: espaciados.xs,
    marginTop: espaciados.xs,
    paddingTop: espaciados.sm,
  },
  textoValidacion: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  tarjetaDatos: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    paddingHorizontal: espaciados.lg,
  },
  filaDato: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espaciados.md,
  },
  etiquetaDato: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  valorDato: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.fuerte,
  },
  divisor: {
    backgroundColor: colores.borde,
    height: 1,
  },
  tarjetaMotivo: {
    backgroundColor: colores.justificadaSuave,
    borderRadius: radios.tarjeta,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloMotivo: {
    color: colores.justificada,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
  },
  textoMotivo: {
    color: colores.tinta,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpo,
  },
  bloqueDuda: {
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.tarjeta,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloDuda: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.fuerte,
  },
  textoDuda: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  tarjetaRevision: {
    backgroundColor: forma.paper,
    borderRadius: radios.superficie,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  filaEstadoRevision: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fechaRevision: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  cajaResolucion: {
    backgroundColor: forma.canvas,
    borderRadius: radios.md,
    gap: espaciados.xs,
    marginTop: espaciados.xs,
    padding: espaciados.md,
  },
  etiquetaResolucion: {
    color: forma.muted,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.micro,
  },
  textoResolucion: {
    color: forma.ink,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  veloModal: {
    alignItems: 'center',
    backgroundColor: forma.scrim,
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  marcoModal: {
    width: '100%',
    flexGrow: 0,
    maxHeight: '100%',
  },
  tarjetaModal: {
    backgroundColor: forma.paper,
    borderRadius: radios.modal,
    gap: espaciados.md,
    padding: espaciados.xl,
    width: '100%',
  },
  tituloModal: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.titulo,
    letterSpacing: interletrado.titulo,
  },
  cuerpoModal: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  botonesModal: {
    flexDirection: 'row',
    gap: espaciados.sm,
    marginTop: espaciados.xs,
  },
  colBotonModal: {
    flex: 1,
  },
  filaBotonesFoto: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
});
