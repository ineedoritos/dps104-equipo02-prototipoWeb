import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

interface MatrizQRProps {
  valor: string;
  tamano?: number;
  atenuado?: boolean;
}

export function MatrizQR({ valor, tamano = 210, atenuado = false }: MatrizQRProps) {
  return (
    <View accessibilityLabel="Código QR de asistencia" style={[styles.marco, atenuado && styles.atenuado]}>
      <QRCode value={valor} size={tamano} quietZone={32} />
    </View>
  );
}

const styles = StyleSheet.create({
  marco: {
    alignSelf: 'center',
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    padding: espaciados.lg,
  },
  atenuado: {
    opacity: 0.28,
  },
});
