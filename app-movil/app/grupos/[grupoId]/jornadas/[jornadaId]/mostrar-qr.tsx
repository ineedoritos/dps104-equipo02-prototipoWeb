import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { MatrizQR } from '@/components/ui/MatrizQR';
import {
  derivarEstadoJornada,
  generarCodigoQR,
  obtenerCodigoQRVigente,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerResumenAsistenciaJornada,
  suscribirStore,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio, type CodigoQR } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';
type CaducidadMinutos = 5 | 10 | 15 | 30;

const OPCIONES_CADUCIDAD: readonly CaducidadMinutos[] = [5, 10, 15, 30];

function formatearSegundosRestantes(segundos: number): string {
  const seguro = Math.max(0, segundos);
  const mins = Math.floor(seguro / 60);
  const secs = seguro % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function MostrarQRScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [caducidad, setCaducidad] = useState<CaducidadMinutos>(15);
  const [codigoQR, setCodigoQR] = useState<CodigoQR | undefined>(() =>
    jornadaId ? obtenerCodigoQRVigente(jornadaId) : undefined,
  );
  const [segundosRestantes, setSegundosRestantes] = useState<number>(0);
  const [resumen, setResumen] = useState(() =>
    jornadaId
      ? obtenerResumenAsistenciaJornada(jornadaId)
      : { presentes: 0, ausentesJustificadas: 0, sinRegistrar: 0, totalParticipantes: 0 },
  );
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [errorAccion, setErrorAccion] = useState('');

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;

  const sincronizar = useCallback(() => {
    if (!jornadaId) {
      return;
    }
    const vigente = obtenerCodigoQRVigente(jornadaId);
    setCodigoQR(vigente);
    setResumen(obtenerResumenAsistenciaJornada(jornadaId));
    if (vigente) {
      const diff = Math.floor((new Date(vigente.expira_en).getTime() - Date.now()) / 1000);
      setSegundosRestantes(Math.max(0, diff));
    } else {
      setSegundosRestantes(0);
    }
  }, [jornadaId]);

  useFocusEffect(
    useCallback(() => {
      if (jornadaId && !obtenerCodigoQRVigente(jornadaId)) {
        try {
          generarCodigoQR(jornadaId, 15);
        } catch {
          // Si la jornada no está en curso, la vista muestra el estado correspondiente.
        }
      }
      sincronizar();
      return suscribirStore(sincronizar);
    }, [jornadaId, sincronizar]),
  );

  useEffect(() => {
    if (!codigoQR) {
      return;
    }
    const actualizar = () => {
      const diff = Math.floor((new Date(codigoQR.expira_en).getTime() - Date.now()) / 1000);
      setSegundosRestantes(Math.max(0, diff));
    };
    actualizar();
    const intervalo = setInterval(actualizar, 1000);
    return () => clearInterval(intervalo);
  }, [codigoQR]);

  if (!grupo || !jornada || rol !== 'responsable') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.botonIcono}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
          <Text style={styles.tituloBarra}>Código de asistencia</Text>
          <View style={styles.espacioDerecha} />
        </View>
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
            texto="Solo un responsable activo puede mostrar o regenerar el código QR."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const estadoJornada = derivarEstadoJornada(jornada);
  const jornadaBloqueada = jornada.cancelada || estadoJornada !== 'en_curso';
  const vencido = !codigoQR || segundosRestantes <= 0;

  const manejarRegenerar = () => {
    setErrorAccion('');
    try {
      generarCodigoQR(jornada.id, caducidad);
      sincronizar();
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorAccion(error.message);
      } else {
        setErrorAccion('No pudimos generar el código QR. Intenta de nuevo.');
      }
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <View style={styles.barraSuperior}>
        <Pressable
          accessibilityLabel="Volver al detalle de jornada"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.botonIcono}
        >
          <Icono color={colores.tinta} nombre="volver" tamano={22} />
        </Pressable>
        <Text numberOfLines={1} style={styles.tituloBarra}>
          Código de asistencia
        </Text>
        <View style={styles.espacioDerecha} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {__DEV__ ? (
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
            <Text style={styles.textoCarga}>Generando código de asistencia…</Text>
          </View>
        ) : null}

        {estadoVista === 'error' ? (
          <Aviso
            accion={
              <Boton
                onPress={() => {
                  setEstadoVista('normal');
                  manejarRegenerar();
                }}
                tamano="sm"
                titulo="Reintentar"
                variante="secundario"
              />
            }
            texto="No pudimos generar el código QR. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista === 'normal' ? (
          <>
            <View style={styles.cabecera}>
              <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
              <Text style={styles.guia}>
                {jornada.control_horas
                  ? 'Pide a cada participante que lo escanee al llegar y al irse.'
                  : 'Pide a cada participante que lo escanee para registrar su presencia.'}
              </Text>
            </View>

            {errorAccion ? <Aviso texto={errorAccion} tipo="error" /> : null}
            {jornadaBloqueada ? (
              <Aviso
                texto="La jornada no está en curso o fue cancelada; no es posible regenerar el código."
                tipo="error"
              />
            ) : null}

            <View style={styles.bloqueCaducidad}>
              <Text style={styles.etiquetaCaducidad}>Caducidad del código</Text>
              <View style={styles.filaChips}>
                {OPCIONES_CADUCIDAD.map((min) => {
                  const activo = caducidad === min;
                  return (
                    <Pressable
                      key={min}
                      accessibilityRole="button"
                      onPress={() => setCaducidad(min)}
                      style={[styles.chipCaducidad, activo && styles.chipCaducidadActivo]}
                    >
                      <Text
                        style={[
                          styles.textoChipCaducidad,
                          cifrasTabulares,
                          activo && styles.textoChipCaducidadActivo,
                        ]}
                      >
                        {min} min
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.panelQR}>
              <MatrizQR
                atenuado={vencido || jornadaBloqueada}
                tamano={210}
                valor={codigoQR?.codigo_hash ?? `RA-${jornada.id.toUpperCase()}-VENCIDO`}
              />

              <Text style={[styles.temporizador, cifrasTabulares]}>
                {vencido
                  ? 'Código vencido · pulsa Regenerar código'
                  : `${formatearSegundosRestantes(segundosRestantes)} para que venza · también vence al terminar la jornada`}
              </Text>

              {codigoQR ? (
                <Text style={[styles.codigoTexto, cifrasTabulares]}>{codigoQR.codigo_hash}</Text>
              ) : null}
            </View>

            <View style={styles.contadorTarjeta}>
              <Text style={[styles.contadorTexto, cifrasTabulares]}>
                Han escaneado {resumen.presentes} de {resumen.totalParticipantes} participantes
              </Text>
              <Pressable accessibilityRole="button" onPress={sincronizar}>
                <Text style={styles.textoRefrescar}>Actualizar</Text>
              </Pressable>
            </View>

            <Boton
              deshabilitado={jornadaBloqueada}
              onPress={manejarRegenerar}
              titulo="Regenerar código"
              variante="secundario"
            />
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
  cabecera: {
    gap: espaciados.xs,
  },
  tituloJornada: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.fuerte,
  },
  guia: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  bloqueCaducidad: {
    gap: espaciados.xs,
  },
  etiquetaCaducidad: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
  },
  filaChips: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  chipCaducidad: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    flex: 1,
    paddingVertical: espaciados.sm,
  },
  chipCaducidadActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoChipCaducidad: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  textoChipCaducidadActivo: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  panelQR: {
    alignItems: 'center',
    gap: espaciados.md,
  },
  temporizador: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
    textAlign: 'center',
  },
  codigoTexto: {
    color: colores.tintaTenue,
    fontSize: tipografia.micro,
  },
  contadorTarjeta: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: espaciados.lg,
  },
  contadorTexto: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  textoRefrescar: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
});
