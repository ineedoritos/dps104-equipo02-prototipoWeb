import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { HoraPickerField } from '@/components/ui/HoraPickerField';
import { Icono } from '@/components/ui/Icono';
import { fechaEnZona, fechaHoraEnZona, horaEnZona } from '@/lib/fecha';
import {
  ajustarHorasAsistencia,
  obtenerAsistenciasDeJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerParticipantesActivos,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas} h ${resto} min`;
}

export default function AjustarHorasScreen() {
  const router = useRouter();
  const { grupoId, jornadaId, participanteId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
    participanteId: string;
  }>();

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;
  const participante = grupoId
    ? obtenerParticipantesActivos(grupoId).find((p) => p.usuario_id === participanteId)
    : undefined;
  const registro = jornadaId
    ? obtenerAsistenciasDeJornada(jornadaId).find((a) => a.participante_id === participanteId)
    : undefined;

  const horaInicioDefault = jornada ? horaEnZona(jornada.inicio_en).slice(0, 5) : '08:00';
  const horaFinDefault = jornada ? horaEnZona(jornada.fin_en).slice(0, 5) : '12:00';

  const [horaEntrada, setHoraEntrada] = useState(() =>
    registro?.hora_entrada ? horaEnZona(registro.hora_entrada).slice(0, 5) : horaInicioDefault,
  );
  const [horaSalida, setHoraSalida] = useState(() =>
    registro?.hora_salida ? horaEnZona(registro.hora_salida).slice(0, 5) : horaFinDefault,
  );
  const [minutosReconocidosTexto, setMinutosReconocidosTexto] = useState(() =>
    registro?.minutos_reconocidos !== null && registro?.minutos_reconocidos !== undefined
      ? String(registro.minutos_reconocidos)
      : '',
  );
  const [motivoAjuste, setMotivoAjuste] = useState(() => registro?.motivo_ajuste ?? '');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');

  const duracionCalculada = useMemo(() => {
    if (!jornada) {
      return null;
    }
    try {
      const fecha = fechaEnZona(jornada.inicio_en);
      const entrada = fechaHoraEnZona(fecha, horaEntrada);
      const salida = fechaHoraEnZona(fecha, horaSalida);
      const mins = Math.floor((salida.getTime() - entrada.getTime()) / 60000);
      if (Number.isNaN(mins) || mins <= 0) {
        return null;
      }
      return mins;
    } catch {
      return null;
    }
  }, [horaEntrada, horaSalida, jornada]);

  if (
    !grupo ||
    !jornada ||
    !participante ||
    rol !== 'responsable' ||
    !jornada.control_horas ||
    registro?.estado !== 'presente'
  ) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.botonIcono}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
          <Text style={styles.tituloBarra}>Ajustar horas</Text>
          <View style={styles.espacioDerecha} />
        </View>
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.back()}
                tamano="sm"
                titulo="Volver"
                variante="secundario"
              />
            }
            texto="Solo puedes ajustar horas a participantes marcados como presentes en jornadas con control de horas."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const reconocidosNumero =
    minutosReconocidosTexto.trim() === ''
      ? (duracionCalculada ?? 0)
      : Number(minutosReconocidosTexto);
  const requiereMotivo =
    duracionCalculada !== null &&
    !Number.isNaN(reconocidosNumero) &&
    reconocidosNumero < duracionCalculada;

  const manejarGuardar = () => {
    setErrorGeneral('');
    if (duracionCalculada === null) {
      setErrorGeneral('Verifica que la hora de salida sea posterior a la de entrada.');
      return;
    }

    const reconocidos =
      minutosReconocidosTexto.trim() === ''
        ? duracionCalculada
        : Number.parseInt(minutosReconocidosTexto, 10);

    if (Number.isNaN(reconocidos)) {
      setErrorGeneral('Ingresa un número válido de minutos reconocidos.');
      return;
    }

    setGuardando(true);
    try {
      ajustarHorasAsistencia(jornada.id, participante.usuario_id, {
        horaEntrada,
        horaSalida,
        minutosReconocidos: reconocidos,
        motivoAjuste,
      });
      router.back();
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral('No pudimos guardar el ajuste de horas. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <View style={styles.barraSuperior}>
        <Pressable
          accessibilityLabel="Volver a asistencia"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.botonIcono}
        >
          <Icono color={colores.tinta} nombre="volver" tamano={22} />
        </Pressable>
        <Text numberOfLines={1} style={styles.tituloBarra}>
          Ajustar horas
        </Text>
        <View style={styles.espacioDerecha} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {__DEV__ ? (
            <View style={styles.barraEstados}>
              {(['normal', 'cargando', 'error'] as const).map((modo) => {
                const activo = estadoVista === modo;
                return (
                  <Pressable
                    key={modo}
                    onPress={() => setEstadoVista(modo)}
                    style={[styles.chipEstado, activo && styles.chipEstadoActivo]}
                  >
                    <Text style={[styles.textoChipEstado, activo && styles.textoChipEstadoActivo]}>
                      {modo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {estadoVista === 'cargando' ? (
            <View style={styles.estadoCentro}>
              <ActivityIndicator color={colores.acento} size="large" />
              <Text style={styles.textoCarga}>Cargando horas del participante…</Text>
            </View>
          ) : null}

          {estadoVista === 'error' ? (
            <Aviso
              accion={
                <Boton
                  onPress={() => setEstadoVista('normal')}
                  tamano="sm"
                  titulo="Reintentar"
                  variante="secundario"
                />
              }
              texto="No pudimos cargar los datos de horas. Intenta de nuevo."
              tipo="error"
            />
          ) : null}

          {estadoVista === 'normal' ? (
            <>
              <View style={styles.cabecera}>
                <Text style={styles.tituloCabecera}>
                  Ajustar horas de {participante.usuario.nombre}
                </Text>
                <Text style={[styles.subtituloCabecera, cifrasTabulares]}>
                  {jornada.titulo} · {horaInicioDefault} – {horaFinDefault}
                </Text>
                {registro.origen === 'qr' ? (
                  <Text style={styles.origenQR}>Registro original por QR (ajuste excepcional)</Text>
                ) : null}
              </View>

              {errorGeneral ? <Aviso texto={errorGeneral} tipo="error" /> : null}

              <View style={styles.filaHoras}>
                <View style={styles.colHora}>
                  <HoraPickerField
                    label="Hora de entrada"
                    onChange={setHoraEntrada}
                    value={horaEntrada}
                  />
                </View>
                <View style={styles.colHora}>
                  <HoraPickerField
                    error={
                      horaSalida <= horaEntrada
                        ? 'La hora de salida debe ser posterior a la de entrada.'
                        : undefined
                    }
                    label="Hora de salida"
                    onChange={setHoraSalida}
                    value={horaSalida}
                  />
                </View>
              </View>

              <View style={styles.tarjetaDuracion}>
                <Text style={styles.etiquetaDuracion}>Duración calculada</Text>
                <Text style={[styles.valorDuracion, cifrasTabulares]}>
                  {duracionCalculada !== null
                    ? `${formatearDuracion(duracionCalculada)} (${duracionCalculada} min)`
                    : 'Horario inválido'}
                </Text>
              </View>

              <View style={styles.campoConAyuda}>
                <CampoTexto
                  etiqueta="Tiempo reconocido (minutos)"
                  keyboardType="number-pad"
                  onChangeText={setMinutosReconocidosTexto}
                  placeholder={duracionCalculada !== null ? String(duracionCalculada) : '0'}
                  value={minutosReconocidosTexto}
                />
                {duracionCalculada !== null ? (
                  <Text style={styles.textoAyuda}>
                    Entre 0 y {duracionCalculada} minutos. Si lo dejas vacío se reconoce el total.
                  </Text>
                ) : null}
              </View>

              <CampoTexto
                etiqueta={
                  requiereMotivo ? 'Motivo del ajuste (obligatorio)' : 'Motivo del ajuste (opcional)'
                }
                multilinea
                numberOfLines={3}
                onChangeText={setMotivoAjuste}
                placeholder="Explica por qué se ajusta el tiempo reconocido"
                value={motivoAjuste}
              />

              <Aviso
                texto={`${participante.usuario.nombre} verá este motivo en su historial. Así evitamos reclamos semanas después.`}
                tipo="info"
              />

              <Boton cargando={guardando} onPress={manejarGuardar} titulo="Guardar horas" />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  barraSuperior: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.sm,
  },
  botonIcono: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  tituloBarra: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  espacioDerecha: {
    width: 44,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxxl,
  },
  barraEstados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  chipEstado: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  chipEstadoActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoChipEstado: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  textoChipEstadoActivo: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  cabecera: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloCabecera: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  subtituloCabecera: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  origenQR: {
    color: colores.info,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  filaHoras: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  colHora: {
    flex: 1,
  },
  tarjetaDuracion: {
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.xs,
    padding: espaciados.md,
  },
  etiquetaDuracion: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
  },
  valorDuracion: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  campoConAyuda: {
    gap: espaciados.xs,
  },
  textoAyuda: {
    color: colores.tintaTenue,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
});
