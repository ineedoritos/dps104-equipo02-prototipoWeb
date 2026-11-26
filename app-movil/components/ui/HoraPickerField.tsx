import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { alturaInteriorCampo, estilosCampo } from '@/components/ui/estilosCampo';
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

  const manejarCambio = (fechaSeleccionada: Date) => {
    if (Platform.OS === 'android') {
      setAbierto(false);
    }

    onChange(dayjs(fechaSeleccionada).format('HH:mm'));
  };

  return (
    <View style={estilosCampo.contenedor}>
      <Text style={estilosCampo.etiqueta}>{label}</Text>

      <View
        style={[
          estilosCampo.marco,
          abierto && estilosCampo.enfocado,
          error ? estilosCampo.conError : null,
          deshabilitado ? estilosCampo.deshabilitado : null,
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

      {error ? <Text accessibilityLiveRegion="polite" style={estilosCampo.textoError}>{error}</Text> : null}

      {abierto && Platform.OS === 'android' ? (
        <DateTimePicker
          display="default"
          is24Hour
          mode="time"
          onDismiss={() => setAbierto(false)}
          onValueChange={(_, fechaSeleccionada) => manejarCambio(fechaSeleccionada)}
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
                onValueChange={(_, fechaSeleccionada) => manejarCambio(fechaSeleccionada)}
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
  campo: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    borderRadius: radios.campo,
    flexDirection: 'row',
    gap: espaciados.sm,
    minHeight: alturaInteriorCampo,
    paddingVertical: espaciados.sm,
    paddingHorizontal: espaciados.md,
  },
  campoPresionado: {
    backgroundColor: colores.acentoSuave,
  },
  campoTexto: {
    ...cifrasTabulares,
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpo,
  },
  placeholder: {
    color: colores.tintaSuave,
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
    borderRadius: radios.modal,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
    maxWidth: 400,
    width: '100%',
  },
  tituloModal: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
});
