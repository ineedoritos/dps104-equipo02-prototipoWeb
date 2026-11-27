import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { Estado, type TonoEstado } from '@/components/ui/Estado';
import { GaleriaFotos } from '@/components/ui/GaleriaFotos';
import { HojaAcciones } from '@/components/ui/HojaAcciones';
import { Icono } from '@/components/ui/Icono';
import { Seccion } from '@/components/ui/Seccion';
import { formatearDia, horaEnZona } from '@/lib/fecha';
import {
  agregarFotoSimulada,
  obtenerFotosDeJornada,
  retirarFoto,
  suscribirFotos,
} from '@/lib/fotosStore';
import {
  cancelarJornada,
  contarPendientesValidacion,
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerResumenAsistenciaJornada,
  suscribirStore,
} from '@/lib/gruposStore';
import {
  contarPendientes,
  obtenerSolicitudesDeJornada,
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
  tamanos,
  tipografia,
} from '@/lib/tema';
import {
  ErrorDominio,
  type EstadoJornada,
  type FotoJornada,
  type Jornada,
} from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

const MAPA_ESTADO_JORNADA: Record<EstadoJornada, { tono: TonoEstado; etiqueta: string }> = {
  en_curso: { tono: 'enCurso', etiqueta: 'En curso' },
  programada: { tono: 'programada', etiqueta: 'Programada' },
  finalizada: { tono: 'completada', etiqueta: 'Finalizada' },
  cancelada: { tono: 'cancelada', etiqueta: 'Cancelada' },
};

export default function DetalleJornadaScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [jornada, setJornada] = useState<Jornada | undefined>(() =>
    jornadaId ? obtenerJornadaPorId(jornadaId) : undefined,
  );
  const [resumen, setResumen] = useState(() =>
    jornadaId
      ? obtenerResumenAsistenciaJornada(jornadaId)
      : { presentes: 0, ausentesJustificadas: 0, sinRegistrar: 0, totalParticipantes: 0 },
  );
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [modalCancelar, setModalCancelar] = useState(false);
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [totalSolicitudes, setTotalSolicitudes] = useState(() =>
    jornadaId ? obtenerSolicitudesDeJornada(jornadaId).length : 0,
  );
  const [pendientesRevision, setPendientesRevision] = useState(() =>
    jornadaId ? contarPendientes(jornadaId) : 0,
  );
  const [fotos, setFotos] = useState<FotoJornada[]>(() =>
    jornadaId ? obtenerFotosDeJornada(jornadaId) : [],
  );
  const [hojaCamaraAbierta, setHojaCamaraAbierta] = useState(false);
  const [errorFoto, setErrorFoto] = useState<'permiso' | 'subida' | null>(null);
  const [mensajeFoto, setMensajeFoto] = useState('');

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;

  const recargar = useCallback(() => {
    if (!jornadaId) {
      return;
    }
    setJornada(obtenerJornadaPorId(jornadaId));
    setResumen(obtenerResumenAsistenciaJornada(jornadaId));
    setTotalSolicitudes(obtenerSolicitudesDeJornada(jornadaId).length);
    setPendientesRevision(contarPendientes(jornadaId));
    setFotos(obtenerFotosDeJornada(jornadaId));
  }, [jornadaId]);

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

  if (!grupo || !jornada || rol !== 'responsable') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <Encabezado
          derecha={
            null
          }
          onVolver={() => router.back()}
          titulo="Detalle de jornada"
        />
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
            texto="No tienes permiso para gestionar esta jornada o ya no está disponible."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const estado = derivarEstadoJornada(jornada);
  const metaEstado = MAPA_ESTADO_JORNADA[estado];
  const fechaTexto = formatearDia(jornada.inicio_en.slice(0, 10), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const horaInicio = horaEnZona(jornada.inicio_en).slice(0, 5);
  const horaFin = horaEnZona(jornada.fin_en).slice(0, 5);

  const esQR = jornada.modalidad_asistencia === 'qr';
  const pendientesValidacion = contarPendientesValidacion(jornada.id);
  const puedeMostrarQR = esQR && estado === 'en_curso' && !jornada.cancelada;
  const puedePasarLista =
    !jornada.cancelada && (estado === 'en_curso' || estado === 'finalizada');

  const manejarConfirmarCancelacion = () => {
    cancelarJornada(jornada.id);
    setModalCancelar(false);
    recargar();
  };

  const puedeAgregarFoto = !jornada.cancelada && estado !== 'programada';
  const motivoBloqueoFoto = jornada.cancelada
    ? 'Las jornadas canceladas no admiten nuevas fotos.'
    : estado === 'programada'
      ? 'Podrás agregar fotos cuando la jornada inicie.'
      : undefined;

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

  const manejarRetirarFoto = (fotoId: string) => {
    setErrorFoto(null);
    setMensajeFoto('');
    try {
      retirarFoto(fotoId);
      recargar();
    } catch (error) {
      setErrorFoto('subida');
      setMensajeFoto(
        error instanceof ErrorDominio
          ? error.message
          : 'No pudimos retirar la foto. Intenta de nuevo.',
      );
    }
  };

  const manejarAbrirAjustes = () => {
    Linking.openSettings().catch(() => {
      setMensajeFoto('Abre los ajustes del teléfono para conceder el permiso de cámara.');
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado
        derecha={
          !jornada.cancelada ? (
            <Pressable
              accessibilityLabel="Más acciones"
              accessibilityRole="button"
              onPress={() => setHojaAbierta(true)}
              style={styles.botonIcono}
            >
              <Icono color={colores.tinta} nombre="mas" tamano={22} />
            </Pressable>
          ) : null
        }
        onVolver={() => router.back()}
        titulo="Detalle de jornada"
      />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>

        {estadoVista === 'cargando' ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator color={colores.acento} size="large" />
            <Text style={styles.textoCarga}>Cargando detalle de jornada…</Text>
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
            texto="No pudimos cargar el detalle de esta jornada. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista === 'normal' ? (
          <>
            {jornada.cancelada ? (
              <Aviso
                texto="Jornada cancelada: sus registros no cuentan en los totales ni admiten nuevas marcas."
                tipo="error"
              />
            ) : null}

            <View style={styles.tarjetaPrincipal}>
              <View style={styles.filaEstado}>
                <Estado etiqueta={metaEstado.etiqueta} tono={metaEstado.tono} />
                <Text style={styles.etiquetaModalidad}>
                  {esQR ? 'Modalidad QR' : 'Modalidad manual'} ·{' '}
                  {jornada.control_horas ? 'con horas' : 'sin horas'}
                </Text>
              </View>

              <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
              <Text style={styles.descripcionJornada}>{jornada.descripcion}</Text>

              <View style={styles.filaHorario}>
                <Icono color={colores.tintaSuave} nombre="reloj" tamano={16} />
                <Text style={[styles.textoHorario, cifrasTabulares]}>
                  {fechaTexto} · {horaInicio} – {horaFin}
                </Text>
              </View>

              {jornada.gps_habilitado ? (
                jornada.ref_ubicacion_en ? (
                  <View style={styles.filaHorario}>
                    <Icono color={forma.mintInk} nombre="lugar" tamano={16} />
                    <Text style={styles.textoUbicacionFijada}>
                      Ubicación de referencia fijada (radio 100 m)
                    </Text>
                  </View>
                ) : (
                  <Aviso
                    texto="Falta capturar la ubicación de referencia para validar el escaneo QR."
                    tipo="info"
                  />
                )
              ) : null}

              <View style={styles.filaHorario}>
                <Icono
                  color={
                    jornada.requiere_validacion && pendientesValidacion > 0
                      ? forma.peachInk
                      : forma.muted
                  }
                  nombre={jornada.requiere_validacion ? 'responsable' : 'info'}
                  tamano={16}
                />
                <Text
                  style={[
                    styles.textoValidacion,
                    jornada.requiere_validacion && pendientesValidacion > 0
                      ? styles.textoValidacionPendiente
                      : null,
                    cifrasTabulares,
                  ]}
                >
                  {jornada.requiere_validacion
                    ? pendientesValidacion > 0
                      ? `${pendientesValidacion} ${pendientesValidacion === 1 ? 'pendiente' : 'pendientes'} de aprobar`
                      : 'Validación activa · sin registros pendientes'
                    : 'Esta jornada no exige validación'}
                </Text>
              </View>
            </View>

            <View style={styles.gridResumen}>
              <View style={styles.tarjetaStat}>
                <Text style={[styles.valorStat, styles.colorPresente, cifrasTabulares]}>
                  {resumen.presentes}
                </Text>
                <Text style={styles.etiquetaStat}>Presentes</Text>
              </View>

              <View style={styles.tarjetaStat}>
                <Text style={[styles.valorStat, styles.colorAusente, cifrasTabulares]}>
                  {resumen.ausentesJustificadas}
                </Text>
                <Text style={styles.etiquetaStat}>Aus. / Justif.</Text>
              </View>

              <View style={styles.tarjetaStat}>
                <Text style={[styles.valorStat, cifrasTabulares]}>{resumen.sinRegistrar}</Text>
                <Text style={styles.etiquetaStat}>Sin registrar</Text>
              </View>
            </View>

            {totalSolicitudes > 0 ? (
              <Pressable
                accessibilityLabel={`Solicitudes de revisión, ${pendientesRevision} ${pendientesRevision === 1 ? 'pendiente' : 'pendientes'}`}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/revisiones',
                    params: { grupoId: grupo.id, jornadaId: jornada.id },
                  })
                }
                style={({ pressed }) => [
                  styles.filaRevisiones,
                  pressed && styles.filaPresionada,
                ]}
              >
                <View
                  style={[
                    styles.iconoRevisiones,
                    {
                      backgroundColor: pendientesRevision > 0 ? forma.peach : forma.mint,
                    },
                  ]}
                >
                  <Icono
                    color={pendientesRevision > 0 ? forma.peachInk : forma.mintInk}
                    nombre={pendientesRevision > 0 ? 'alerta' : 'hecho'}
                    tamano={20}
                  />
                </View>
                <View style={styles.textoRevisiones}>
                  <Text style={styles.tituloRevisiones}>Solicitudes de revisión</Text>
                  <Text style={styles.subtituloRevisiones}>
                    {pendientesRevision > 0
                      ? 'Reclamos de participantes por revisar'
                      : 'Todas las solicitudes fueron atendidas'}
                  </Text>
                </View>
                <Estado
                  etiqueta={
                    pendientesRevision > 0
                      ? `${pendientesRevision} ${pendientesRevision === 1 ? 'pendiente' : 'pendientes'}`
                      : 'Al día'
                  }
                  tono={pendientesRevision > 0 ? 'pendiente' : 'resuelta'}
                />
                <Icono color={forma.muted} nombre="avanzar" tamano={18} />
              </Pressable>
            ) : null}

            <View style={styles.acciones}>
              {puedeMostrarQR ? (
                <Boton
                  onPress={() =>
                    router.push({
                      pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/mostrar-qr',
                      params: { grupoId: grupo.id, jornadaId: jornada.id },
                    })
                  }
                  titulo="Mostrar QR"
                />
              ) : null}

              {puedePasarLista ? (
                <Boton
                  onPress={() =>
                    router.push({
                      pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/asistencia',
                      params: { grupoId: grupo.id, jornadaId: jornada.id },
                    })
                  }
                  titulo={esQR ? 'Ver asistencia y corregir' : 'Pasar lista'}
                  variante={puedeMostrarQR ? 'secundario' : 'primario'}
                />
              ) : null}

              {!jornada.cancelada && estado === 'programada' ? (
                <Aviso
                  texto="La jornada aún está programada. Podrás registrar asistencia cuando inicie su horario."
                  tipo="info"
                />
              ) : null}

            </View>

            {jornada.modo_fotos !== 'no_permitidas' ? (
              <Seccion titulo="Fotos de la jornada">
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
                      'Necesitamos acceso a tu cámara para agregar fotos de la jornada.'
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
                  esResponsable
                  fotos={fotos}
                  motivoBloqueoAgregar={motivoBloqueoFoto}
                  onAgregarFoto={solicitarAgregarFoto}
                  onRetirarFoto={manejarRetirarFoto}
                  puedeAgregar={puedeAgregarFoto}
                />
              </Seccion>
            ) : null}
          </>
        ) : null}
      </ScrollView>

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
                'Necesitamos acceso a tu cámara para agregar fotos de la jornada.',
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

      <HojaAcciones
        acciones={[
          {
            etiqueta: 'Editar jornada',
            icono: 'editar',
            onPress: () =>
              router.push({
                pathname: '/grupos/[grupoId]/jornadas/crear',
                params: { grupoId: grupo.id, jornadaId: jornada.id },
              }),
          },
          {
            etiqueta: 'Cancelar jornada',
            icono: 'cancelar',
            peligro: true,
            onPress: () => setModalCancelar(true),
          },
        ]}
        onCerrar={() => setHojaAbierta(false)}
        visible={hojaAbierta}
      />
      <Modal
        animationType="fade"
        onRequestClose={() => setModalCancelar(false)}
        transparent
        visible={modalCancelar}
      >
        <View style={styles.veloModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.tituloModal}>¿Cancelar esta jornada?</Text>
            <Text style={styles.cuerpoModal}>
              Sus registros existentes se conservarán como referencia, pero quedarán excluidos de los
              reportes y no se podrán registrar nuevas asistencias.
            </Text>
            <View style={styles.botonesModal}>
              <View style={styles.colBotonModal}>
                <Boton
                  onPress={() => setModalCancelar(false)}
                  titulo="Volver"
                  variante="secundario"
                />
              </View>
              <View style={styles.colBotonModal}>
                <Boton
                  onPress={manejarConfirmarCancelacion}
                  titulo="Sí, cancelar"
                  variante="peligro"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colores.superficie,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.sm,
  },
  botonIcono: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  tituloBarra: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
    textAlign: 'center',
  },
  espacioDerecha: {
    width: 44,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxxl,
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
  tarjetaPrincipal: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  filaEstado: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  etiquetaModalidad: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontFamily: fuentes.medio,
  },
  tituloJornada: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    letterSpacing: interletrado.titulo,
    fontFamily: fuentes.fuerte,
  },
  descripcionJornada: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpo,
    lineHeight: 22,
  },
  filaHorario: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
    marginTop: espaciados.xs,
  },
  textoHorario: {
    color: colores.tintaSuave,
    flex: 1,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  textoUbicacionFijada: {
    color: forma.mintInk,
    flex: 1,
    fontFamily: fuentes.medio,
    fontSize: tipografia.cuerpoSm,
  },
  textoValidacion: {
    color: forma.muted,
    flex: 1,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  textoValidacionPendiente: {
    color: forma.peachInk,
    fontFamily: fuentes.fuerte,
  },
  gridResumen: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  tarjetaStat: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    flex: 1,
    gap: espaciados.xs,
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.md,
  },
  valorStat: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    letterSpacing: interletrado.titulo,
    fontFamily: fuentes.fuerte,
  },
  colorPresente: {
    color: colores.presente,
  },
  colorAusente: {
    color: colores.ausente,
  },
  etiquetaStat: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontFamily: fuentes.medio,
    textAlign: 'center',
  },
  acciones: {
    gap: espaciados.md,
  },
  filaRevisiones: {
    alignItems: 'center',
    backgroundColor: forma.paper,
    borderRadius: radios.tarjeta,
    flexDirection: 'row',
    gap: espaciados.md,
    minHeight: tamanos.fila,
    paddingHorizontal: espaciados.lg,
    paddingVertical: espaciados.md,
  },
  filaPresionada: {
    transform: [{ scale: 0.98 }],
  },
  iconoRevisiones: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: tamanos.objetivo,
    justifyContent: 'center',
    width: tamanos.objetivo,
  },
  textoRevisiones: {
    flex: 1,
    gap: 2,
  },
  tituloRevisiones: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpoSm,
  },
  subtituloRevisiones: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  filaBotonesFoto: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  veloModal: {
    alignItems: 'center',
    backgroundColor: colores.velo,
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  tarjetaModal: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
    width: '100%',
  },
  tituloModal: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  cuerpoModal: {
    color: colores.tintaSuave,
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
});
