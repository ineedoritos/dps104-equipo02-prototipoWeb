import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/actividades/ActivityCard';
import actividadesJson from '@/data/actividades.json';
import usuarioJson from '@/data/usuario.json';
import { colores, espaciados, radios } from '@/lib/tema';
import type {
  Actividad,
  EstadoActividad,
  FiltrosActividades,
  Usuario,
} from '@/types/actividad';

const actividades = actividadesJson as Actividad[];
const usuario = usuarioJson as Usuario;

const OPCIONES_ESTADO: { valor: EstadoActividad | 'all'; etiqueta: string }[] = [
  { valor: 'all', etiqueta: 'Todos los estados' },
  { valor: 'upcoming', etiqueta: 'Próximas' },
  { valor: 'current', etiqueta: 'En curso' },
  { valor: 'completed', etiqueta: 'Completadas' },
];

function esFechaISO(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  return !Number.isNaN(new Date(`${valor}T00:00:00`).getTime());
}

export default function InicioScreen() {
  const [filtros, setFiltros] = useState<FiltrosActividades>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [mostrarEstados, setMostrarEstados] = useState(false);
  const ultimaAtras = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return;
      }

      const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
        const ahora = Date.now();

        if (ahora - ultimaAtras.current < 2000) {
          return false;
        }

        ultimaAtras.current = ahora;
        ToastAndroid.show('Presiona atrás de nuevo para salir', ToastAndroid.SHORT);
        return true;
      });

      return () => suscripcion.remove();
    }, []),
  );

  const desdeInvalido = filtros.dateFrom.length > 0 && !esFechaISO(filtros.dateFrom);
  const hastaInvalido = filtros.dateTo.length > 0 && !esFechaISO(filtros.dateTo);

  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideEstado = filtros.status === 'all' || actividad.status === filtros.status;
    const coincideDesde =
      !esFechaISO(filtros.dateFrom) || actividad.date >= filtros.dateFrom;
    const coincideHasta = !esFechaISO(filtros.dateTo) || actividad.date <= filtros.dateTo;

    return coincideEstado && coincideDesde && coincideHasta;
  });

  const etiquetaEstado =
    OPCIONES_ESTADO.find((opcion) => opcion.valor === filtros.status)?.etiqueta ??
    'Todos los estados';

  const limpiarFiltros = () => {
    setFiltros({ status: 'all', dateFrom: '', dateTo: '' });
    setMostrarEstados(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tarjetaPrincipal}>
          <View style={styles.encabezado}>
            <Text style={styles.saludo}>¡Hola, {usuario.name}! 👋</Text>
            <Text style={styles.descripcionEncabezado}>
              Tu comunidad te necesita. Consulta tus actividades y registra tu participación.
            </Text>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>Filtrar actividades</Text>
            <Text style={styles.descripcionSeccion}>
              Encuentra actividades según su estado, categoría o fecha.
            </Text>

            <View style={styles.panelFiltros}>
              <View style={styles.campoGrupo}>
                <Text style={styles.etiqueta}>Estado</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setMostrarEstados((visible) => !visible)}
                  style={({ pressed }) => [styles.campo, pressed && styles.campoPresionado]}
                >
                  <Text style={styles.campoTexto}>{etiquetaEstado}</Text>
                  <Text style={styles.chevron}>{mostrarEstados ? '▲' : '▼'}</Text>
                </Pressable>

                {mostrarEstados ? (
                  <View style={styles.listaOpciones}>
                    {OPCIONES_ESTADO.map((opcion) => {
                      const activa = filtros.status === opcion.valor;

                      return (
                        <Pressable
                          key={opcion.valor}
                          onPress={() => {
                            setFiltros((anteriores) => ({
                              ...anteriores,
                              status: opcion.valor,
                            }));
                            setMostrarEstados(false);
                          }}
                          style={[styles.opcion, activa && styles.opcionActiva]}
                        >
                          <Text style={[styles.opcionTexto, activa && styles.opcionTextoActiva]}>
                            {opcion.etiqueta}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>

              <View style={styles.filaFechas}>
                <View style={[styles.campoGrupo, styles.campoMitad]}>
                  <Text style={styles.etiqueta}>Desde</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    onChangeText={(valor) =>
                      setFiltros((anteriores) => ({ ...anteriores, dateFrom: valor }))
                    }
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colores.textoSuave}
                    style={[styles.campo, desdeInvalido && styles.campoError]}
                    value={filtros.dateFrom}
                  />
                  {desdeInvalido ? (
                    <Text style={styles.textoError}>Usa el formato AAAA-MM-DD</Text>
                  ) : null}
                </View>

                <View style={[styles.campoGrupo, styles.campoMitad]}>
                  <Text style={styles.etiqueta}>Hasta</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    onChangeText={(valor) =>
                      setFiltros((anteriores) => ({ ...anteriores, dateTo: valor }))
                    }
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colores.textoSuave}
                    style={[styles.campo, hastaInvalido && styles.campoError]}
                    value={filtros.dateTo}
                  />
                  {hastaInvalido ? (
                    <Text style={styles.textoError}>Usa el formato AAAA-MM-DD</Text>
                  ) : null}
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={limpiarFiltros}
                style={({ pressed }) => [styles.botonSecundario, pressed && styles.campoPresionado]}
              >
                <Text style={styles.botonSecundarioTexto}>Limpiar filtros</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>Mis actividades</Text>
            <Text style={styles.descripcionSeccion}>
              Consulta tus próximas actividades y revisa las que ya has realizado.
            </Text>

            {actividadesFiltradas.length > 0 ? (
              <View style={styles.listaActividades}>
                {actividadesFiltradas.map((actividad) => (
                  <ActivityCard key={actividad.id} actividad={actividad} />
                ))}
              </View>
            ) : (
              <View style={styles.estadoVacio}>
                <Text style={styles.estadoVacioIcono}>🗓️</Text>
                <Text style={styles.estadoVacioTitulo}>No hay actividades con esos filtros</Text>
                <Text style={styles.estadoVacioDescripcion}>
                  Prueba con otro estado o rango de fechas para ver más resultados.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={limpiarFiltros}
                  style={({ pressed }) => [styles.botonSecundario, pressed && styles.campoPresionado]}
                >
                  <Text style={styles.botonSecundarioTexto}>Limpiar filtros</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.fondo,
    flex: 1,
  },
  contenido: {
    padding: espaciados.md,
    paddingBottom: espaciados.xl,
  },
  tarjetaPrincipal: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.xl,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  encabezado: {
    marginBottom: espaciados.lg,
  },
  saludo: {
    color: colores.texto,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  descripcionEncabezado: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 21,
    marginTop: espaciados.sm,
  },
  seccion: {
    marginTop: espaciados.lg,
  },
  tituloSeccion: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  descripcionSeccion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
    marginTop: espaciados.xs,
  },
  panelFiltros: {
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    gap: espaciados.md,
    marginTop: espaciados.md,
    padding: espaciados.md,
  },
  campoGrupo: {
    gap: espaciados.sm,
  },
  filaFechas: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  campoMitad: {
    flex: 1,
  },
  etiqueta: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
  campo: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    color: colores.grisTexto,
    flexDirection: 'row',
    fontSize: 14,
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  campoPresionado: {
    opacity: 0.85,
  },
  campoTexto: {
    color: colores.grisTexto,
    flex: 1,
    fontSize: 14,
  },
  chevron: {
    color: colores.textoSuave,
    fontSize: 10,
  },
  campoError: {
    borderColor: '#DC2626',
  },
  textoError: {
    color: '#B91C1C',
    fontSize: 11,
  },
  listaOpciones: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  opcion: {
    borderTopColor: colores.grisSuave,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  opcionActiva: {
    backgroundColor: colores.primarioSuave,
  },
  opcionTexto: {
    color: colores.grisTexto,
    fontSize: 14,
  },
  opcionTextoActiva: {
    color: colores.primario,
    fontWeight: '700',
  },
  botonSecundario: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: espaciados.md,
    paddingVertical: 12,
  },
  botonSecundarioTexto: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
  listaActividades: {
    gap: espaciados.md,
    marginTop: espaciados.md,
  },
  estadoVacio: {
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    marginTop: espaciados.md,
    padding: espaciados.lg,
  },
  estadoVacioIcono: {
    fontSize: 32,
  },
  estadoVacioTitulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '700',
    marginTop: espaciados.sm,
    textAlign: 'center',
  },
  estadoVacioDescripcion: {
    color: colores.textoSuave,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: espaciados.md,
    marginTop: espaciados.xs,
    textAlign: 'center',
  },
});
