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
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { HojaAcciones } from '@/components/ui/HojaAcciones';
import { Estado, type TonoEstado } from '@/components/ui/Estado';
import { Icono } from '@/components/ui/Icono';
import { formatearDia, horaEnZona } from '@/lib/fecha';
import {
  cancelarJornada,
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerResumenAsistenciaJornada,
  suscribirStore,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
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
  const [hojaAbierta, setHojaAbierta] = useState(false);

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
  const puedeMostrarQR = esQR && estado === 'en_curso' && !jornada.cancelada;
  const puedePasarLista =
    !jornada.cancelada && (estado === 'en_curso' || estado === 'finalizada');

  const manejarConfirmarCancelacion = () => {
    cancelarJornada(jornada.id);
    setModalCancelar(false);
    recargar();
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
          </>
        ) : null}
      </ScrollView>

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
