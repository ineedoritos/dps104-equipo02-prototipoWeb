import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DatePickerField } from '@/components/ui/DatePickerField';
import { agregarActividad } from '@/lib/mockStore';
import { colores, espaciados, radios } from '@/lib/tema';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function CrearActividadScreen() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [ubicacion, setUbicacion] = useState('');
  const [error, setError] = useState('');

  const manejarGuardar = () => {
    if (!titulo.trim() || !descripcion.trim() || !ubicacion.trim()) {
      setError('Completa título, descripción y ubicación.');
      return;
    }

    if (!fecha) {
      setError('Selecciona una fecha para la actividad.');
      return;
    }

    if (!REGEX_HORA.test(horaInicio.trim()) || !REGEX_HORA.test(horaFin.trim())) {
      setError('Usa formato de hora 24h HH:mm (ejemplo: 08:00 y 11:30).');
      return;
    }

    if (horaFin.trim() <= horaInicio.trim()) {
      setError('La hora de fin debe ser mayor que la hora de inicio.');
      return;
    }

    agregarActividad({
      title: titulo,
      description: descripcion,
      date: fecha,
      startTime: horaInicio,
      endTime: horaFin,
      location: ubicacion,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.pantalla}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.botonVolver}>
            <Text style={styles.textoVolver}>← Volver</Text>
          </Pressable>

          <Text style={styles.titulo}>Nueva actividad</Text>

          <View style={styles.tarjeta}>
            <Text style={styles.etiqueta}>Título</Text>
            <TextInput
              onChangeText={(valor) => {
                setTitulo(valor);
                if (error) setError('');
              }}
              placeholder="Ej. Jornada de limpieza comunitaria"
              placeholderTextColor={colores.textoSuave}
              style={styles.campo}
              value={titulo}
            />

            <Text style={styles.etiqueta}>Descripción</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={(valor) => {
                setDescripcion(valor);
                if (error) setError('');
              }}
              placeholder="Describe brevemente el objetivo de la actividad"
              placeholderTextColor={colores.textoSuave}
              style={[styles.campo, styles.campoMultilinea]}
              textAlignVertical="top"
              value={descripcion}
            />

            <View style={styles.bloqueFecha}>
              <DatePickerField label="Fecha" onChange={setFecha} value={fecha} />
            </View>

            <View style={styles.filaHoras}>
              <View style={styles.mitad}>
                <Text style={styles.etiqueta}>Hora inicio</Text>
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(valor) => {
                    setHoraInicio(valor);
                    if (error) setError('');
                  }}
                  placeholder="08:00"
                  placeholderTextColor={colores.textoSuave}
                  style={styles.campo}
                  value={horaInicio}
                />
              </View>

              <View style={styles.mitad}>
                <Text style={styles.etiqueta}>Hora fin</Text>
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(valor) => {
                    setHoraFin(valor);
                    if (error) setError('');
                  }}
                  placeholder="11:00"
                  placeholderTextColor={colores.textoSuave}
                  style={styles.campo}
                  value={horaFin}
                />
              </View>
            </View>

            <Text style={styles.etiqueta}>Ubicación</Text>
            <TextInput
              onChangeText={(valor) => {
                setUbicacion(valor);
                if (error) setError('');
              }}
              placeholder="Ej. Casa Comunal, Sector Norte"
              placeholderTextColor={colores.textoSuave}
              style={styles.campo}
              value={ubicacion}
            />

            {error ? <Text style={styles.textoError}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              onPress={manejarGuardar}
              style={({ pressed }) => [styles.botonGuardar, pressed && styles.presionado]}
            >
              <Text style={styles.textoGuardar}>Crear actividad</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: espaciados.md,
    paddingBottom: espaciados.xl,
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
  titulo: {
    color: colores.texto,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: espaciados.md,
    marginTop: espaciados.sm,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  etiqueta: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: espaciados.xs,
    marginTop: espaciados.md,
  },
  bloqueFecha: {
    marginTop: espaciados.md,
  },
  campo: {
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    color: colores.texto,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  campoMultilinea: {
    minHeight: 84,
  },
  filaHoras: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  mitad: {
    flex: 1,
  },
  textoError: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    marginTop: espaciados.md,
  },
  botonGuardar: {
    alignItems: 'center',
    backgroundColor: colores.primario,
    borderRadius: radios.md,
    marginTop: espaciados.lg,
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
