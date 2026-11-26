import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import { ESTADO_ASISTENCIA, Estado } from '@/components/ui/Estado';
import { Seccion } from '@/components/ui/Seccion';
import { fechaEnZona, formatearDia, formatearDuracion, horaEnZona } from '@/lib/fecha';
import {
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiAsistenciaEnJornada,
  obtenerResponsableDeGrupo,
  obtenerSesionActual,
  suscribirStore,
} from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

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

  const recargar = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
      return suscribirStore(recargar);
    }, [recargar]),
  );

  void tick;
  const sesion = obtenerSesionActual();
  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;
  const asistencia = jornadaId ? obtenerMiAsistenciaEnJornada(jornadaId) : undefined;
  const responsable = grupoId ? obtenerResponsableDeGrupo(grupoId) : undefined;

  if (!sesion || !grupo || !jornada) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Detalle del registro" />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                icono="reloj"
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

  const fechaTexto = formatearDia(fechaEnZona(jornada.inicio_en), {
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

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior titulo="Detalle del registro" />

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

            <View style={styles.bloqueDuda}>
              <Text style={styles.tituloDuda}>¿Algo no cuadra?</Text>
              <Text style={styles.textoDuda}>
                Avísale hoy al responsable mientras todos lo recuerdan
                {responsable ? ` (${responsable.nombre})` : ''}.
              </Text>
            </View>
          </>
        ) : null}
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
  tituloBarra: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  espacioDerecha: {
    width: 40,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
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
  tarjetaCabecera: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
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
    fontWeight: pesos.fuerte,
  },
  metaGrupo: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  metaFecha: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  tarjetaDatos: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
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
    fontSize: tipografia.cuerpoSm,
  },
  valorDato: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  divisor: {
    backgroundColor: colores.borde,
    height: 1,
  },
  tarjetaMotivo: {
    backgroundColor: colores.justificadaSuave,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloMotivo: {
    color: colores.justificada,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  textoMotivo: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
  },
  bloqueDuda: {
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloDuda: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  textoDuda: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
});
