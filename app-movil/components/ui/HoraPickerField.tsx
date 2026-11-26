import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

interface HoraPickerFieldProps {
  label: string;
  value: string;
  onChange: (horaHHmm: string) => void;
  error?: string;
  deshabilitado?: boolean;
}

function parsearHoraADate(horaHHmm: string): Date {
  const [horasTexto, minutosTexto] = horaHHmm.split(':');
  const horas = Number.parseInt(horasTexto ?? '', 10);
  const minutos = Number.parseInt(minutosTexto ?? '', 10);

  const fecha = new Date();
  fecha.setHours(
    Number.isFinite(horas) && horas >= 0 && horas <= 23 ? horas : 8,
    Number.isFinite(minutos) && minutos >= 0 && minutos <= 59 ? minutos : 0,
    0,
    0,
  );
  return fecha;
}

export function HoraPickerField({
  label,
  value,
  onChange,
  error,
  deshabilitado = false,
}: HoraPickerFieldProps) {
  const [abierto, setAbierto] = useState(false);

  const fechaActual = parsearHoraADate(value);

  const manejarCambio = (evento: DateTimePickerEvent, fechaSeleccionada?: Date) => {
    if (Platform.OS === 'android') {
      setAbierto(false);
    }

    if (evento.type === 'set' && fechaSeleccionada) {
      onChange(dayjs(fechaSeleccionada).format('HH:mm'));
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{label}</Text>

      <View
        style={[
          styles.campoContenedor,
          error ? styles.campoConError : null,
          deshabilitado ? styles.campoDeshabilitado : null,
        ]}
      >
        <Pressable
          accessibilityLabel={`${label}, ${value || 'sin seleccionar'}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: deshabilitado }}
          disabled={deshabilitado}
          onPress={() => setAbierto(true)}
          style={({ pressed }) => [
            styles.campo,
            pressed && !deshabilitado && styles.campoPresionado,
          ]}
        >
          <Icono color={colores.tintaSuave} nombre="reloj" tamano={16} />
          <Text style={[styles.campoTexto, !value && styles.placeholder]}>
            {value || 'Seleccionar'}
          </Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.textoError}>{error}</Text> : null}

      {abierto && Platform.OS === 'android' ? (
        <DateTimePicker
          display="default"
          is24Hour
          mode="time"
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
                display="spinner"
                is24Hour
                mode="time"
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
  campoDeshabilitado: {
    opacity: 0.6,
  },
  campo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: espaciados.sm,
    minHeight: 46,
    paddingHorizontal: espaciados.md,
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
