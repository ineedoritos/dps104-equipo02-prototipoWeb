import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { Estado, type TonoEstado } from '@/components/ui/Estado';
import { Icono } from '@/components/ui/Icono';
import { fechaEnZona, formatearDia, horaEnZona } from '@/lib/fecha';
import {
  cancelarJornada,
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerResumenAsistenciaJornada,
  suscribirStore,
} from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { EstadoJornada, Jornada } from '@/types/dominio';

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

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;

  const recargar = useCallback(() => {
    if (!jornadaId) {
      return;
    }
    setJornada(obtenerJornadaPorId(jornadaId));
    setResumen(obtenerResumenAsistenciaJornada(jornadaId));
  }, [jornadaId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
      return suscribirStore(recargar);
    }, [recargar]),
  );

  if (!grupo || !jornada || rol !== 'responsable') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Detalle de jornada" />
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
            texto="No tienes permiso para gestionar esta jornada o ya no está disponible."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const estado = derivarEstadoJornada(jornada);
  const metaEstado = MAPA_ESTADO_JORNADA[estado];
  const fechaTexto = formatearDia(fechaEnZona(jornada.inicio_en), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const horaInicio = horaEnZona(jornada.inicio_en).slice(0, 5);
  const horaFin = horaEnZona(jornada.fin_en).slice(0, 5);

  const esQR = jornada.modalidad_asistencia === 'qr';
  const puedeMostrarQR = mostrarControlesDePrueba && esQR && estado === 'en_curso' && !jornada.cancelada;
  const puedePasarLista =
    !jornada.cancelada && (estado === 'en_curso' || estado === 'finalizada');

  const manejarConfirmarCancelacion = () => {
    cancelarJornada(jornada.id);
    setModalCancelar(false);
    recargar();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior accessibilityLabelVolver="Volver al grupo" titulo="Detalle de jornada" />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {mostrarControlesDePrueba ? (
          <View style={styles.barraEstados}>
            {(['normal', 'cargando', 'error'] as const).map((modo) => {
              const activo = estadoVista === modo;
              return (
                <Pressable
                  key={modo}
                  onPress={() => setEstadoVista(modo)}
                  style={[styles.chipEstado, activo && styles.chipEstadoActivo]}
                >
                  <Text style={[styles.textoChipEstado, activo && styles.textoChipEstadoActivo]}>
                    {modo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

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

            <View style={styles.acciones}>
              {puedeMostrarQR ? (
                <Boton
                  icono="qr"
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
                  icono="lista"
                  onPress={() =>
                    router.push({
                      pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/asistencia',
                      params: { grupoId: grupo.id, jornadaId: jornada.id },
                    })
                  }
                  titulo={puedeMostrarQR ? 'Ver asistencia y corregir' : 'Pasar lista'}
                  variante={puedeMostrarQR ? 'secundario' : 'primario'}
                />
              ) : null}

              {!jornada.cancelada && estado === 'programada' ? (
                <Aviso
                  texto="La jornada aún está programada. Podrás registrar asistencia cuando inicie su horario."
                  tipo="info"
                />
              ) : null}

              {!jornada.cancelada ? (
                <View style={styles.filaAccionesSecundarias}>
                  <Boton
                    estilo={styles.botonSecundarioFila}
                    icono="editar"
                    onPress={() =>
                      router.push({
                        pathname: '/grupos/[grupoId]/jornadas/crear',
                        params: { grupoId: grupo.id, jornadaId: jornada.id },
                      })
                    }
                    titulo="Editar jornada"
                    variante="secundario"
                  />
                  <Boton
                    estilo={styles.botonSecundarioFila}
                    icono="cerrar"
                    onPress={() => setModalCancelar(true)}
                    titulo="Cancelar jornada"
                    variante="peligro"
                  />
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

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
    fontWeight: pesos.fuerte,
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
  barraEstados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  chipEstado: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  chipEstadoActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoChipEstado: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  textoChipEstadoActivo: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  tarjetaPrincipal: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
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
    fontWeight: pesos.medio,
  },
  tituloJornada: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.fuerte,
  },
  descripcionJornada: {
    color: colores.tintaSuave,
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
    fontSize: tipografia.cuerpoSm,
  },
  gridResumen: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  tarjetaStat: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    flex: 1,
    gap: espaciados.xs,
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.md,
  },
  valorStat: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.fuerte,
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
    fontWeight: pesos.medio,
    textAlign: 'center',
  },
  acciones: {
    gap: espaciados.md,
  },
  filaAccionesSecundarias: {
    flexDirection: 'row',
    gap: espaciados.md,
    marginTop: espaciados.xs,
  },
  botonSecundarioFila: {
    flex: 1,
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
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
    width: '100%',
  },
  tituloModal: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  cuerpoModal: {
    color: colores.tintaSuave,
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
