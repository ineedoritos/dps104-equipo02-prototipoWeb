import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { formatearDuracion } from '@/lib/fecha';
import { obtenerGrupoPorId, obtenerJornadaPorId } from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { TipoConfirmacionQR } from '@/types/dominio';

const TIPOS_VALIDOS: readonly TipoConfirmacionQR[] = [
  'presencia',
  'entrada',
  'salida',
  'ya_completa',
];

function esTipoValido(valor: string | undefined): valor is TipoConfirmacionQR {
  return Boolean(valor && TIPOS_VALIDOS.includes(valor as TipoConfirmacionQR));
}

export default function ConfirmacionQRScreen() {
  const router = useRouter();
  const { grupoId, jornadaId, tipo, horaTexto, duracionMinutos } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
    tipo?: string;
    horaTexto?: string;
    duracionMinutos?: string;
  }>();

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;
  const parametrosValidos = Boolean(grupo && jornada && esTipoValido(tipo));

  useEffect(() => {
    if (!parametrosValidos) {
      router.replace('/(tabs)/historial');
    }
  }, [parametrosValidos, router]);

  if (!parametrosValidos || !grupo || !jornada || !esTipoValido(tipo)) {
    return null;
  }

  const minutosNum = duracionMinutos ? Number(duracionMinutos) : null;
  const esInformativa = tipo === 'ya_completa';

  let titulo = 'Presencia registrada';
  let subtituloHora = horaTexto ? `Hora de registro: ${horaTexto}` : '';
  let detalleExtra = '';

  if (tipo === 'entrada') {
    titulo = horaTexto ? `Entrada registrada · ${horaTexto}` : 'Entrada registrada';
    subtituloHora = '';
    detalleExtra = 'Al irte, escanea otra vez para registrar tu salida y calcular tus horas.';
  } else if (tipo === 'salida') {
    titulo = horaTexto ? `Salida registrada · ${horaTexto}` : 'Salida registrada';
    subtituloHora =
      minutosNum !== null && !Number.isNaN(minutosNum)
        ? `${formatearDuracion(minutosNum)} registradas`
        : '';
  } else if (tipo === 'ya_completa') {
    titulo = 'Tu registro para esta jornada ya estaba completo';
    subtituloHora = '';
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.tarjetaConfirmacion}>
          <View
            style={[
              styles.circuloEstado,
              esInformativa ? styles.circuloInfo : styles.circuloExito,
            ]}
          >
            <Icono
              color={esInformativa ? colores.info : colores.acento}
              nombre={esInformativa ? 'info' : 'hecho'}
              tamano={36}
            />
          </View>

          <Text style={[styles.titulo, cifrasTabulares]}>{titulo}</Text>

          {subtituloHora ? (
            <Text style={[styles.subtituloHora, cifrasTabulares]}>{subtituloHora}</Text>
          ) : null}

          <View style={styles.cajaContexto}>
            <Text style={styles.etiquetaContexto}>Jornada</Text>
            <Text style={styles.valorContexto}>{jornada.titulo}</Text>
            <Text style={styles.grupoContexto}>{grupo.nombre}</Text>
          </View>

          {detalleExtra ? <Aviso texto={detalleExtra} tipo="info" /> : null}
        </View>

        <View style={styles.acciones}>
          <Boton
            icono="reloj"
            onPress={() =>
              router.replace({
                pathname: '/(tabs)/historial',
                params: { grupoId: grupo.id },
              })
            }
            titulo="Ver mi historial"
          />
          <Boton
            onPress={() =>
              router.replace({
                pathname: '/grupos/[grupoId]',
                params: { grupoId: grupo.id },
              })
            }
            titulo="Volver al grupo"
            variante="secundario"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    gap: espaciados.xl,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  tarjetaConfirmacion: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.xl,
  },
  circuloEstado: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  circuloExito: {
    backgroundColor: colores.acentoSuave,
  },
  circuloInfo: {
    backgroundColor: colores.infoSuave,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  subtituloHora: {
    color: colores.acento,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  cajaContexto: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    gap: espaciados.xs,
    padding: espaciados.md,
    width: '100%',
  },
  etiquetaContexto: {
    color: colores.tintaTenue,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  valorContexto: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  grupoContexto: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
  acciones: {
    gap: espaciados.md,
  },
});
