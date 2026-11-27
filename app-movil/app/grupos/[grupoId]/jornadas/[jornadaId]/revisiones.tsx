import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
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
import { Encabezado } from '@/components/ui/Encabezado';
import { Estado } from '@/components/ui/Estado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { formatearFecha, horaEnZona } from '@/lib/fecha';
import {
  obtenerAsistenciasDeJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  suscribirStore,
} from '@/lib/gruposStore';
import {
  obtenerNombreUsuarioSolicitud,
  obtenerSolicitudesDeJornada,
  resolverSolicitud,
  hayCorreccion,
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
import { ErrorDominio, type Asistencia, type SolicitudRevision } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

export default function RevisionesJornadaScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [solicitudes, setSolicitudes] = useState<SolicitudRevision[]>(() =>
    jornadaId ? obtenerSolicitudesDeJornada(jornadaId) : [],
  );
  const [asistencias, setAsistencias] = useState<Asistencia[]>(() =>
    jornadaId ? obtenerAsistenciasDeJornada(jornadaId) : [],
  );
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [solicitudActiva, setSolicitudActiva] = useState<SolicitudRevision | null>(null);
  const [accionModal, setAccionModal] = useState<'resuelta' | 'rechazada'>('resuelta');
  const [motivoResolucion, setMotivoResolucion] = useState('');
  const [errorResolucion, setErrorResolucion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;

  const recargar = useCallback(() => {
    if (!jornadaId) {
      return;
    }
    setSolicitudes(obtenerSolicitudesDeJornada(jornadaId));
    setAsistencias(obtenerAsistenciasDeJornada(jornadaId));
  }, [jornadaId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
      const desuscribirStore = suscribirStore(recargar);
      const desuscribirRev = suscribirRevisiones(recargar);
      return () => {
        desuscribirStore();
        desuscribirRev();
      };
    }, [recargar]),
  );

  if (!grupo || !jornada || rol !== 'responsable') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <Encabezado onVolver={() => router.back()} titulo="Solicitudes de revisión" />
        <View style={styles.contenidoError}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.replace('/(tabs)')}
                tamano="sm"
                titulo="Ir a Mis grupos"
                variante="secundario"
              />
            }
            texto="Solo un responsable activo puede revisar solicitudes en esta jornada."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const abrirResolucion = (
    solicitud: SolicitudRevision,
    accion: 'resuelta' | 'rechazada',
  ) => {
    setSolicitudActiva(solicitud);
    setAccionModal(accion);
    setMotivoResolucion('');
    setErrorResolucion('');
  };

  const confirmarResolucion = () => {
    if (!solicitudActiva) {
      return;
    }
    if (!motivoResolucion.trim()) {
      setErrorResolucion('Escribe el motivo de tu decisión.');
      return;
    }

    setErrorResolucion('');
    setGuardando(true);
    try {
      resolverSolicitud(solicitudActiva.id, accionModal, motivoResolucion);
      setSolicitudActiva(null);
      setMotivoResolucion('');
      recargar();
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorResolucion(error.message);
      } else {
        setErrorResolucion('No pudimos guardar la resolución. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const mapaAsistencias = new Map(asistencias.map((a) => [a.participante_id, a]));

  const renderTarjeta = ({ item }: { item: SolicitudRevision }) => {
    const nombreParticipante = obtenerNombreUsuarioSolicitud(item.participante_id);
    const fechaTexto = `${formatearFecha(item.creado_en, {
      day: 'numeric',
      month: 'short',
    })} · ${horaEnZona(item.creado_en).slice(0, 5)}`;
    const registroParticipante = mapaAsistencias.get(item.participante_id);
    const puedeAjustarHoras =
      jornada.control_horas && registroParticipante?.estado === 'presente';

    return (
      <View style={styles.tarjeta}>
        <View style={styles.filaCabecera}>
          <View style={styles.infoParticipante}>
            <Text style={styles.nombreParticipante}>{nombreParticipante}</Text>
            <Text style={[styles.fechaTexto, cifrasTabulares]}>{fechaTexto}</Text>
          </View>
          <Estado tono={item.estado} />
        </View>

        <Text selectable style={styles.motivoSolicitud}>
          {item.motivo_solicitud}
        </Text>

        {item.motivo_resolucion ? (
          <View style={styles.cajaResolucion}>
            <Text style={styles.etiquetaResolucion}>
              Resolución
              {item.resuelta_por
                ? ` · ${obtenerNombreUsuarioSolicitud(item.resuelta_por)}`
                : ''}
            </Text>
            <Text style={styles.textoResolucion}>{item.motivo_resolucion}</Text>
          </View>
        ) : null}

        {item.estado === 'pendiente' && !jornada.cancelada ? (
          <View style={styles.bloqueAcciones}>
            <View style={styles.filaAtajos}>
              <Boton
                onPress={() =>
                  router.push({
                    pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/asistencia',
                    params: { grupoId: grupo.id, jornadaId: jornada.id },
                  })
                }
                tamano="sm"
                titulo="Corregir asistencia"
                variante="fantasma"
              />
              {puedeAjustarHoras ? (
                <Boton
                  onPress={() =>
                    router.push({
                      pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/ajustar-horas',
                      params: {
                        grupoId: grupo.id,
                        jornadaId: jornada.id,
                        participanteId: item.participante_id,
                      },
                    })
                  }
                  tamano="sm"
                  titulo="Ajustar horas"
                  variante="fantasma"
                />
              ) : null}
            </View>

            <View style={styles.filaDecision}>
              <View style={styles.colDecision}>
                <Boton
                  onPress={() => abrirResolucion(item, 'rechazada')}
                  tamano="sm"
                  titulo="Rechazar"
                  variante="peligro"
                />
              </View>
              <View style={styles.colDecision}>
                <Boton
                  onPress={() => abrirResolucion(item, 'resuelta')}
                  tamano="sm"
                  deshabilitado={!hayCorreccion(item)}
                  titulo="Resolver"
                  variante="secundario"
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado onVolver={() => router.back()} titulo="Solicitudes de revisión" />

      <FlatList
        ListEmptyComponent={
          estadoVista === 'normal' ? (
            <EstadoVacio
              descripcion="Cuando un participante envíe una solicitud de revisión sobre esta jornada, aparecerá aquí."
              icono="alerta"
              titulo="Sin solicitudes todavía."
            />
          ) : undefined
        }
        ListHeaderComponent={
          <View style={styles.cabeceraLista}>
            <View style={styles.tarjetaJornada}>
              <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
              <Text style={styles.subtituloJornada}>
                Para resolver una solicitud, corrige la asistencia o las horas y luego marca la
                solicitud como resuelta.
              </Text>
            </View>

            {jornada.cancelada ? (
              <Aviso
                texto="Esta jornada fue cancelada y no admite cambios sobre las solicitudes."
                tipo="error"
              />
            ) : null}

            {estadoVista === 'cargando' ? (
              <View style={styles.estadoCentro}>
                <ActivityIndicator color={colores.acento} size="large" />
                <Text style={styles.textoCarga}>Cargando solicitudes…</Text>
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
                texto="No pudimos cargar las solicitudes. Intenta de nuevo."
                tipo="error"
              />
            ) : null}
          </View>
        }
        contentContainerStyle={styles.contenido}
        data={estadoVista === 'normal' ? solicitudes : []}
        keyExtractor={(item) => item.id}
        renderItem={renderTarjeta}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setSolicitudActiva(null)}
        transparent
        visible={Boolean(solicitudActiva)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.veloModal}
        >
          <ScrollView style={styles.marcoModal} contentContainerStyle={styles.tarjetaModal} keyboardShouldPersistTaps="handled">
            <Text style={styles.tituloModal}>
              {accionModal === 'resuelta' ? 'Resolver solicitud' : 'Rechazar solicitud'}
            </Text>
            <Text style={styles.cuerpoModal}>
              {solicitudActiva
                ? `Indica el motivo para ${obtenerNombreUsuarioSolicitud(solicitudActiva.participante_id)}.`
                : ''}
            </Text>
            <CampoTexto
              error={errorResolucion || undefined}
              etiqueta="Motivo de la resolución"
              maxLength={500}
              multilinea
              numberOfLines={3}
              onChangeText={(texto) => {
                setMotivoResolucion(texto);
                if (errorResolucion) {
                  setErrorResolucion('');
                }
              }}
              placeholder="Ej. Se actualizó tu hora de salida según el registro."
              value={motivoResolucion}
            />
            <View style={styles.filaDecision}>
              <View style={styles.colDecision}>
                <Boton
                  deshabilitado={guardando}
                  onPress={() => setSolicitudActiva(null)}
                  titulo="Cancelar"
                  variante="secundario"
                />
              </View>
              <View style={styles.colDecision}>
                <Boton
                  cargando={guardando}
                  onPress={confirmarResolucion}
                  titulo="Confirmar"
                  variante={accionModal === 'rechazada' ? 'peligro' : 'primario'}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: forma.canvas,
    flex: 1,
  },
  contenidoError: {
    padding: espaciados.lg,
  },
  contenido: {
    flexGrow: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  cabeceraLista: {
    gap: espaciados.md,
  },
  tarjetaJornada: {
    backgroundColor: forma.paper,
    borderRadius: radios.superficie,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloJornada: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
  },
  subtituloJornada: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  tarjeta: {
    backgroundColor: forma.paper,
    borderRadius: radios.superficie,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  filaCabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  infoParticipante: {
    flex: 1,
    gap: 2,
  },
  nombreParticipante: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpo,
  },
  fechaTexto: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  motivoSolicitud: {
    color: forma.ink,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  cajaResolucion: {
    backgroundColor: forma.canvas,
    borderRadius: radios.md,
    gap: espaciados.xs,
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
  bloqueAcciones: {
    borderTopColor: forma.line,
    borderTopWidth: 1,
    gap: espaciados.sm,
    marginTop: espaciados.xs,
    paddingTop: espaciados.sm,
  },
  filaAtajos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  filaDecision: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  colDecision: {
    flex: 1,
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
});
