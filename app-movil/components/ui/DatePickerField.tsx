import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (fechaISO: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar',
  minDate,
  maxDate,
}: DatePickerFieldProps) {
  const [abierto, setAbierto] = useState(false);

  const fechaActual = value ? dayjs(value, 'YYYY-MM-DD').toDate() : new Date();
  const fechaMinima = minDate ? dayjs(minDate, 'YYYY-MM-DD').toDate() : undefined;
  const fechaMaxima = maxDate ? dayjs(maxDate, 'YYYY-MM-DD').toDate() : undefined;

  const manejarCambio = (evento: DateTimePickerEvent, fechaSeleccionada?: Date) => {
    if (Platform.OS === 'android') {
      setAbierto(false);
    }

    if (evento.type === 'set' && fechaSeleccionada) {
      onChange(dayjs(fechaSeleccionada).format('YYYY-MM-DD'));
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{label}</Text>
      <View style={styles.campoContenedor}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar fecha ${label}`}
          onPress={() => setAbierto(true)}
          style={({ pressed }) => [styles.campo, pressed && styles.campoPresionado]}
        >
          <Text style={[styles.campoTexto, !value && styles.placeholder]}>
            {value ? dayjs(value).format('DD/MM/YYYY') : placeholder}
          </Text>
        </Pressable>

        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Limpiar fecha ${label}`}
            onPress={() => onChange('')}
            style={({ pressed }) => [styles.botonLimpiar, pressed && styles.campoPresionado]}
          >
            <Text style={styles.textoLimpiar}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {abierto && Platform.OS === 'android' ? (
        <DateTimePicker
          display="default"
          maximumDate={fechaMaxima}
          minimumDate={fechaMinima}
          mode="date"
          onChange={manejarCambio}
          value={fechaActual}
        />
      ) : null}

      {abierto && Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent
          visible={abierto}
          onRequestClose={() => setAbierto(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalTarjeta}>
              <DateTimePicker
                display="inline"
                maximumDate={fechaMaxima}
                minimumDate={fechaMinima}
                mode="date"
                onChange={manejarCambio}
                value={fechaActual}
              />
              <Pressable onPress={() => setAbierto(false)} style={styles.botonCerrar}>
                <Text style={styles.textoCerrar}>Listo</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.sm,
  },
  etiqueta: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
  campoContenedor: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 44,
  },
  campo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  campoPresionado: {
    opacity: 0.75,
  },
  campoTexto: {
    color: colores.grisTexto,
    fontSize: 14,
  },
  placeholder: {
    color: colores.textoSuave,
  },
  botonLimpiar: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  textoLimpiar: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: '700',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  modalTarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    padding: espaciados.md,
    width: '100%',
  },
  botonCerrar: {
    alignSelf: 'flex-end',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  textoCerrar: {
    color: colores.primario,
    fontSize: 15,
    fontWeight: '700',
  },
});
