import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  guardarAsistenciasActividad,
  obtenerActividadPorId,
  obtenerAsistenciasActividad,
  obtenerParticipantes,
} from '@/lib/mockStore';
import { colores, espaciados, radios } from '@/lib/tema';
import type { EstadoAsistencia, RegistroAsistencia } from '@/types/actividad';

type MapaAsistencia = Record<number, { estado?: EstadoAsistencia; motivo: string }>;

const OPCIONES: { estado: EstadoAsistencia; letra: string }[] = [
  { estado: 'presente', letra: 'P' },
  { estado: 'ausente', letra: 'A' },
  { estado: 'justificada', letra: 'J' },
];

export default function ActividadDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const actividadId = Number(id);

  const actividad = obtenerActividadPorId(actividadId);
  const participantes = obtenerParticipantes();

  const [mapa, setMapa] = useState<MapaAsistencia>(() => {
    const iniciales: MapaAsistencia = {};
    const guardados = obtenerAsistenciasActividad(actividadId);

    for (const p of participantes) {
      const registro = guardados.find((r) => r.participanteId === p.id);
      iniciales[p.id] = {
        estado: registro?.estado,
        motivo: registro?.motivo ?? '',
      };
    }

    return iniciales;
  });

  const [error, setError] = useState('');

  const resumen = useMemo(() => {
    let presentes = 0;
    let ausentes = 0;
    let justificadas = 0;

    for (const item of Object.values(mapa)) {
      if (item.estado === 'presente') presentes += 1;
      if (item.estado === 'ausente') ausentes += 1;
      if (item.estado === 'justificada') justificadas += 1;
    }

    return { presentes, ausentes, justificadas };
  }, [mapa]);

  if (!actividad) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.vacio}>
          <Text style={styles.titulo}>Actividad no encontrada</Text>
          <Pressable onPress={() => router.back()} style={styles.botonVolver}>
            <Text style={styles.textoVolver}>← Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const seleccionarEstado = (participanteId: number, estado: EstadoAsistencia) => {
    setError('');
    setMapa((previo) => {
      const actual = previo[participanteId] ?? { motivo: '' };
      const nuevoEstado = actual.estado === estado ? undefined : estado;
      return {
        ...previo,
        [participanteId]: {
          estado: nuevoEstado,
          motivo: nuevoEstado === 'justificada' ? actual.motivo : '',
        },
      };
    });
  };

  const cambiarMotivo = (participanteId: number, motivo: string) => {
    setError('');
    setMapa((previo) => ({
      ...previo,
      [participanteId]: {
        ...(previo[participanteId] ?? {}),
        motivo,
      },
    }));
  };

  const manejarGuardar = () => {
    const registros: RegistroAsistencia[] = [];

    for (const p of participantes) {
      const item = mapa[p.id];
      if (!item?.estado) {
        continue;
      }

      if (item.estado === 'justificada' && !item.motivo.trim()) {
        setError(`Ingresa el motivo de ausencia justificada para ${p.nombre}.`);
        return;
      }

      registros.push({
        actividadId,
        participanteId: p.id,
        estado: item.estado,
        motivo: item.estado === 'justificada' ? item.motivo.trim() : undefined,
      });
    }

    guardarAsistenciasActividad(actividadId, registros);
    Alert.alert('Asistencia guardada', 'Los cambios se actualizaron en el reporte.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.botonVolver}>
          <Text style={styles.textoVolver}>← Volver</Text>
        </Pressable>

        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>{actividad.title}</Text>
          <Text style={styles.meta}>
            {dayjs(actividad.date).format('DD/MM/YYYY')} · {actividad.startTime}
            {actividad.endTime ? ` - ${actividad.endTime}` : ''}
          </Text>
          <Text style={styles.meta}>📍 {actividad.location}</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>Participantes y asistencia manual</Text>
          <Text style={styles.leyenda}>P Presente · A Ausente · J Justificada</Text>

          <View style={styles.lista}>
            {participantes.map((participante) => {
              const item = mapa[participante.id] ?? { motivo: '' };

              return (
                <View key={participante.id} style={styles.filaParticipante}>
                  <View style={styles.filaSuperior}>
                    <View style={styles.infoParticipante}>
                      <Text style={styles.nombreParticipante}>{participante.nombre}</Text>
                      <Text style={styles.correoParticipante}>{participante.correo}</Text>
                    </View>

                    <View style={styles.grupoBotones}>
                      {OPCIONES.map((opcion) => {
                        const activo = item.estado === opcion.estado;
                        return (
                          <Pressable
                            key={opcion.estado}
                            onPress={() => seleccionarEstado(participante.id, opcion.estado)}
                            style={[
                              styles.botonEstado,
                              activo && styles[`boton_${opcion.estado}`],
                            ]}
                          >
                            <Text
                              style={[
                                styles.textoEstado,
                                activo && styles.textoEstadoActivo,
                              ]}
                            >
                              {opcion.letra}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {item.estado === 'justificada' ? (
                    <TextInput
                      onChangeText={(texto) => cambiarMotivo(participante.id, texto)}
                      placeholder="Motivo de la ausencia (obligatorio)"
                      placeholderTextColor={colores.textoSuave}
                      style={styles.campoMotivo}
                      value={item.motivo}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={styles.resumen}>
            <Text style={styles.resumenTexto}>
              {resumen.presentes} presentes · {resumen.ausentes} ausentes · {resumen.justificadas}{' '}
              justificadas
            </Text>
          </View>

          {error ? <Text style={styles.textoError}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={manejarGuardar}
            style={({ pressed }) => [styles.botonGuardar, pressed && styles.presionado]}
          >
            <Text style={styles.textoGuardar}>Guardar asistencia</Text>
          </Pressable>
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
    flexGrow: 1,
    gap: espaciados.md,
    padding: espaciados.md,
    paddingBottom: espaciados.xl,
  },
  vacio: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  botonVolver: {
    alignSelf: 'flex-start',
    paddingVertical: espaciados.xs,
  },
  textoVolver: {
    color: colores.primario,
    fontSize: 15,
    fontWeight: '600',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  titulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: colores.textoSuave,
    fontSize: 13,
    marginTop: 4,
  },
  tituloSeccion: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '700',
  },
  leyenda: {
    color: colores.textoSuave,
    fontSize: 12,
    marginTop: 4,
  },
  lista: {
    marginTop: espaciados.md,
  },
  filaParticipante: {
    borderTopColor: colores.grisSuave,
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  filaSuperior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espaciados.sm,
  },
  infoParticipante: {
    flex: 1,
  },
  nombreParticipante: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  correoParticipante: {
    color: colores.textoSuave,
    fontSize: 12,
    marginTop: 2,
  },
  grupoBotones: {
    flexDirection: 'row',
    gap: 6,
  },
  botonEstado: {
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.sm,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  boton_presente: {
    backgroundColor: colores.exitoPunto,
    borderColor: colores.exitoPunto,
  },
  boton_ausente: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  boton_justificada: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  textoEstado: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '700',
  },
  textoEstadoActivo: {
    color: colores.superficie,
  },
  campoMotivo: {
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.sm,
    borderWidth: 1,
    color: colores.texto,
    fontSize: 13,
    marginTop: espaciados.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  resumen: {
    backgroundColor: colores.fondo,
    borderRadius: radios.md,
    marginTop: espaciados.md,
    padding: espaciados.sm + 2,
  },
  resumenTexto: {
    color: colores.grisTexto,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  textoError: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    marginTop: espaciados.sm,
  },
  botonGuardar: {
    alignItems: 'center',
    backgroundColor: colores.primario,
    borderRadius: radios.md,
    marginTop: espaciados.md,
    paddingVertical: 14,
  },
  presionado: {
    opacity: 0.85,
  },
  textoGuardar: {
    color: colores.superficie,
    fontSize: 16,
    fontWeight: '700',
  },
});
