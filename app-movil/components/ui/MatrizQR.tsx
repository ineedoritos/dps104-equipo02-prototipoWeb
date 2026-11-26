import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colores, espaciados } from '@/lib/tema';

interface MatrizQRProps {
  valor: string;
  tamano?: number;
  atenuado?: boolean;
}

const TAMANO_GRILLA = 21;

function esPatronFijo(fila: number, col: number): boolean | null {
  const enEsquina = (f0: number, c0: number): boolean | null => {
    const df = fila - f0;
    const dc = col - c0;
    if (df < 0 || df > 6 || dc < 0 || dc > 6) {
      return null;
    }
    if (df === 0 || df === 6 || dc === 0 || dc === 6) {
      return true;
    }
    if (df >= 2 && df <= 4 && dc >= 2 && dc <= 4) {
      return true;
    }
    return false;
  };

  return (
    enEsquina(0, 0) ??
    enEsquina(0, TAMANO_GRILLA - 7) ??
    enEsquina(TAMANO_GRILLA - 7, 0)
  );
}

function esSeparador(fila: number, col: number): boolean {
  const topLeft = fila <= 7 && col <= 7 && (fila === 7 || col === 7);
  const topRight = fila <= 7 && col >= TAMANO_GRILLA - 8 && (fila === 7 || col === TAMANO_GRILLA - 8);
  const bottomLeft = fila >= TAMANO_GRILLA - 8 && col <= 7 && (fila === TAMANO_GRILLA - 8 || col === 7);
  return topLeft || topRight || bottomLeft;
}

/**
 * Representación visual determinística del token QR sin dependencias externas.
 * Permite mostrar y regenerar el código de forma nítida en alto contraste.
 */
export function MatrizQR({ valor, tamano = 210, atenuado = false }: MatrizQRProps) {
  const celdas = useMemo(() => {
    let semilla = 2166136261;
    for (let i = 0; i < valor.length; i += 1) {
      semilla ^= valor.charCodeAt(i);
      semilla = Math.imul(semilla, 16777619);
    }

    const matriz: boolean[][] = [];
    for (let f = 0; f < TAMANO_GRILLA; f += 1) {
      const fila: boolean[] = [];
      for (let c = 0; c < TAMANO_GRILLA; c += 1) {
        const fijo = esPatronFijo(f, c);
        if (fijo !== null) {
          fila.push(fijo);
          continue;
        }
        if (esSeparador(f, c)) {
          fila.push(false);
          continue;
        }
        semilla ^= (f * 31 + c * 17 + 13) >>> 0;
        semilla = Math.imul(semilla, 16777619);
        fila.push((semilla >>> 24) % 2 === 0);
      }
      matriz.push(fila);
    }
    return matriz;
  }, [valor]);

  const celdaPx = Math.floor(tamano / TAMANO_GRILLA);
  const ladoReal = celdaPx * TAMANO_GRILLA;

  return (
    <View
      accessibilityLabel="Código QR de asistencia"
      style={[styles.marco, atenuado && styles.atenuado]}
    >
      <View style={{ width: ladoReal, height: ladoReal }}>
        {celdas.map((fila, idxFila) => (
          <View key={idxFila} style={styles.fila}>
            {fila.map((activa, idxCol) => (
              <View
                key={idxCol}
                style={{
                  width: celdaPx,
                  height: celdaPx,
                  backgroundColor: activa ? colores.tinta : colores.superficie,
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: {
    alignSelf: 'center',
    backgroundColor: colores.superficie,
    padding: espaciados.lg,
  },
  atenuado: {
    opacity: 0.28,
  },
  fila: {
    flexDirection: 'row',
  },
});
