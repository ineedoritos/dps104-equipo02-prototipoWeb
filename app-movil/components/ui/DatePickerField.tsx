import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (fechaISO: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  error?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar',
  minDate,
  maxDate,
  error,
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

      <View style={[styles.campoContenedor, error ? styles.campoConError : null]}>
        <Pressable
          accessibilityLabel={`Seleccionar fecha ${label}`}
          accessibilityRole="button"
          onPress={() => setAbierto(true)}
          style={({ pressed }) => [styles.campo, pressed && styles.campoPresionado]}
        >
          <Icono color={colores.tintaSuave} nombre="calendario" tamano={16} />
          <Text style={[styles.campoTexto, !value && styles.placeholder]}>
            {value ? dayjs(value).format('DD/MM/YYYY') : placeholder}
          </Text>
        </Pressable>

        {value ? (
          <Pressable
            accessibilityLabel={`Limpiar fecha ${label}`}
            accessibilityRole="button"
            hitSlop={4}
            onPress={() => onChange('')}
            style={({ pressed }) => [styles.botonLimpiar, pressed && styles.campoPresionado]}
          >
            <Icono color={colores.tintaSuave} nombre="cerrar" tamano={16} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.textoError}>{error}</Text> : null}

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
          onRequestClose={() => setAbierto(false)}
          transparent
          visible={abierto}
        >
          <View style={styles.overlay}>
            <View style={styles.modalTarjeta}>
              <Text style={styles.tituloModal}>{label}</Text>
              <DateTimePicker
                display="inline"
                maximumDate={fechaMaxima}
                minimumDate={fechaMinima}
                mode="date"
                onChange={manejarCambio}
                value={fechaActual}
              />
              <Boton onPress={() => setAbierto(false)} titulo="Listo" />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.xs,
  },
  etiqueta: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
    letterSpacing: 0.2,
  },
  campoContenedor: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  campoConError: {
    borderColor: colores.ausente,
  },
  campo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: espaciados.sm,
    minHeight: 46,
    paddingLeft: espaciados.md,
    paddingRight: espaciados.sm,
  },
  campoPresionado: {
    opacity: 0.75,
  },
  campoTexto: {
    ...cifrasTabulares,
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpo,
  },
  placeholder: {
    color: colores.tintaTenue,
  },
  botonLimpiar: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  textoError: {
    color: colores.ausente,
    fontSize: tipografia.micro,
    lineHeight: 15,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: colores.velo,
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  modalTarjeta: {
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
});
