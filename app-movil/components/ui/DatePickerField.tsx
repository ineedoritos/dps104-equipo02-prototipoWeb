import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { alturaInteriorCampo, estilosCampo } from '@/components/ui/estilosCampo';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (fechaISO: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  error?: string;
  permitirLimpiar?: boolean;
  deshabilitado?: boolean;
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar',
  minDate,
  maxDate,
  error,
  permitirLimpiar = true,
  deshabilitado = false,
}: DatePickerFieldProps) {
  const [abierto, setAbierto] = useState(false);

  const fechaActual = value ? dayjs(value, 'YYYY-MM-DD').toDate() : new Date();
  const fechaMinima = minDate ? dayjs(minDate, 'YYYY-MM-DD').toDate() : undefined;
  const fechaMaxima = maxDate ? dayjs(maxDate, 'YYYY-MM-DD').toDate() : undefined;

  const manejarCambio = (fechaSeleccionada: Date) => {
    if (Platform.OS === 'android') {
      setAbierto(false);
    }

    onChange(dayjs(fechaSeleccionada).format('YYYY-MM-DD'));
  };

  return (
    <View style={estilosCampo.contenedor}>
      <Text style={estilosCampo.etiqueta}>{label}</Text>

      <View
        style={[
          estilosCampo.marco,
          abierto && estilosCampo.enfocado,
          error ? estilosCampo.conError : null,
          deshabilitado && estilosCampo.deshabilitado,
        ]}
      >
        <Pressable
          accessibilityLabel={`Seleccionar fecha ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: deshabilitado }}
          disabled={deshabilitado}
          accessibilityValue={{ text: value ? dayjs(value).format('DD/MM/YYYY') : placeholder }}
          onPress={() => setAbierto(true)}
          style={({ pressed }) => [styles.campo, pressed && styles.campoPresionado]}
        >
          <Icono color={colores.tintaSuave} nombre="calendario" tamano={16} />
          <Text style={[styles.campoTexto, !value && styles.placeholder]}>
            {value ? dayjs(value).format('DD/MM/YYYY') : placeholder}
          </Text>
        </Pressable>

        {value && permitirLimpiar && !deshabilitado ? (
          <Pressable
            accessibilityLabel={`Limpiar fecha ${label}`}
            accessibilityRole="button"
            onPress={() => onChange('')}
            style={({ pressed }) => [styles.botonLimpiar, pressed && styles.campoPresionado]}
          >
            <Icono color={colores.tintaSuave} nombre="cerrar" tamano={16} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text accessibilityLiveRegion="polite" style={estilosCampo.textoError}>{error}</Text> : null}

      {abierto && Platform.OS === 'android' ? (
        <DateTimePicker
          display="default"
          maximumDate={fechaMaxima}
          minimumDate={fechaMinima}
          mode="date"
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
                display="inline"
                maximumDate={fechaMaxima}
                minimumDate={fechaMinima}
                mode="date"
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
    paddingLeft: espaciados.md,
    paddingRight: espaciados.sm,
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
  botonLimpiar: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
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
