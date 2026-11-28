import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { HojaAcciones } from '@/components/ui/HojaAcciones';
import { HoraPickerField } from '@/components/ui/HoraPickerField';
import { Icono } from '@/components/ui/Icono';
import { PieAccion } from '@/components/ui/PieAccion';
import { aISOConOffset, fechaEnZona, horaEnZona } from '@/lib/fecha';
import {
  crearJornada,
  editarJornada,
  jornadaTieneRegistros,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
} from '@/lib/gruposStore';
import { colores, espaciados, forma, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import { type CasoUbicacionSimulada, obtenerUbicacionActual } from '@/lib/ubicacionSimulada';
import { ErrorDominio } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

export default function CrearOEditarJornadaScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId?: string;
  }>();

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornadaExistente = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;
  const esEdicion = Boolean(jornadaId && jornadaExistente);
  const horarioBloqueado = esEdicion && jornadaExistente ? jornadaTieneRegistros(jornadaExistente.id) : false;

  const [titulo, setTitulo] = useState(jornadaExistente?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(jornadaExistente?.descripcion ?? '');
  const [fecha, setFecha] = useState(() =>
    jornadaExistente ? fechaEnZona(jornadaExistente.inicio_en) : fechaEnZona(),
  );
  const [horaInicio, setHoraInicio] = useState(() =>
    jornadaExistente ? horaEnZona(jornadaExistente.inicio_en).slice(0, 5) : '08:00',
  );
  const [horaFin, setHoraFin] = useState(() =>
    jornadaExistente ? horaEnZona(jornadaExistente.fin_en).slice(0, 5) : '12:00',
  );
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refLatitud, setRefLatitud] = useState<number | null>(
    jornadaExistente?.ref_latitud ?? null,
  );
  const [refLongitud, setRefLongitud] = useState<number | null>(
    jornadaExistente?.ref_longitud ?? null,
  );
  const [refUbicacionEn, setRefUbicacionEn] = useState<string | null>(
    jornadaExistente?.ref_ubicacion_en ?? null,
  );
  const [precisionMetros, setPrecisionMetros] = useState<number>(12);
  const [capturandoGps, setCapturandoGps] = useState(false);
  const [errorGps, setErrorGps] = useState('');
  const [hojaGpsAbierta, setHojaGpsAbierta] = useState(false);

  if (!grupo || rol !== 'responsable' || (jornadaId && !jornadaExistente)) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <Encabezado
          onVolver={() => router.back()}
          titulo={esEdicion ? 'Editar jornada' : 'Nueva jornada'}
        />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.replace('/(tabs)')}
                tamano="sm"
                titulo="Ir a Mis grupos"
                variante="secundario"
              />
            }
            texto="Solo un responsable activo puede crear o editar jornadas en este grupo."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const gpsActivo = esEdicion && jornadaExistente ? jornadaExistente.gps_habilitado : grupo.gps_habilitado;
  const modalidadTexto =
    grupo.modalidad_asistencia === 'qr' ? 'Asistencia por QR' : 'Asistencia manual';
  const horasTexto = grupo.control_horas ? 'con control de horas' : 'sin control de horas';
  const fotosTexto =
    grupo.modo_fotos === 'obligatorias'
      ? 'fotos obligatorias'
      : grupo.modo_fotos === 'opcionales'
        ? 'fotos opcionales'
        : 'sin fotos';
  const gpsTexto = gpsActivo ? ' · con GPS puntual' : '';

  const errorHoraFin =
    !horarioBloqueado && horaFin <= horaInicio
      ? 'La hora de fin debe ser posterior a la de inicio.'
      : undefined;

  const ejecutarCapturaGps = async (caso: CasoUbicacionSimulada) => {
    setErrorGps('');
    setErrorGeneral('');
    setCapturandoGps(true);
    try {
      const lectura = await obtenerUbicacionActual(caso);
      if (lectura === 'sin_permiso') {
        setErrorGps(
          'Necesitamos tu ubicación para fijar la referencia de esta jornada. Actívala en los ajustes del teléfono.',
        );
        return;
      }
      setRefLatitud(lectura.latitud);
      setRefLongitud(lectura.longitud);
      setRefUbicacionEn(aISOConOffset());
      setPrecisionMetros(lectura.precision_metros);
    } finally {
      setCapturandoGps(false);
    }
  };

  const solicitarCapturaGps = () => {
    if (__DEV__) {
      setHojaGpsAbierta(true);
    } else {
      void ejecutarCapturaGps('dentro_radio');
    }
  };

  const manejarGuardar = () => {
    setErrorGeneral('');

    if (!titulo.trim()) {
      setErrorGeneral('Ingresa un título para la jornada.');
      return;
    }
    if (!descripcion.trim()) {
      setErrorGeneral('Ingresa una descripción breve de la actividad.');
      return;
    }
    if (!fecha.trim()) {
      setErrorGeneral('Selecciona la fecha de la jornada.');
      return;
    }
    if (errorHoraFin) {
      setErrorGeneral(errorHoraFin);
      return;
    }
    if (gpsActivo && (refLatitud == null || refLongitud == null)) {
      setErrorGeneral('Captura la ubicación de la jornada antes de guardar.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = esEdicion && jornadaExistente
        ? editarJornada(jornadaExistente.id, {
            titulo,
            descripcion,
            fecha,
            horaInicio,
            horaFin,
            refLatitud,
            refLongitud,
            refUbicacionEn,
          })
        : crearJornada(grupo.id, {
            titulo,
            descripcion,
            fecha,
            horaInicio,
            horaFin,
            refLatitud,
            refLongitud,
            refUbicacionEn,
          });

      router.replace({
        pathname: '/grupos/[grupoId]/jornadas/[jornadaId]',
        params: { grupoId: grupo.id, jornadaId: resultado.id },
      });
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral('No pudimos guardar la jornada. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado
        onVolver={() => router.back()}
        titulo={esEdicion ? 'Editar jornada' : 'Nueva jornada'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {estadoVista === 'cargando' ? (
            <View style={styles.estadoCentro}>
              <ActivityIndicator color={colores.acento} size="large" />
              <Text style={styles.textoCarga}>Cargando formulario…</Text>
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
              texto="No pudimos cargar la información de la jornada. Intenta de nuevo."
              tipo="error"
            />
          ) : null}

          {estadoVista === 'normal' ? (
            <>
              <View style={styles.tarjetaInfo}>
                <Icono color={colores.info} nombre="info" tamano={18} />
                <View style={styles.tarjetaInfoTexto}>
                  <Text style={styles.tituloInfo}>Usa la configuración actual del grupo</Text>
                  <Text style={styles.subtituloInfo}>
                    {modalidadTexto} · {horasTexto} · {fotosTexto}{gpsTexto}
                  </Text>
                </View>
              </View>

              {horarioBloqueado ? (
                <Aviso
                  texto="Ya hay registros de asistencia en esta jornada; el horario quedó fijo."
                  tipo="info"
                />
              ) : null}

              {errorGeneral ? <Aviso texto={errorGeneral} tipo="error" /> : null}

              <View style={styles.tarjetaFormulario}>
              <CampoTexto
                etiqueta="Título"
                onChangeText={setTitulo}
                placeholder="Ej. Entrega de paquetes alimentarios"
                value={titulo}
              />

              <CampoTexto
                etiqueta="Descripción"
                multilinea
                numberOfLines={3}
                onChangeText={setDescripcion}
                placeholder="Describe brevemente la actividad que se realizará"
                value={descripcion}
              />

              <View style={horarioBloqueado ? styles.bloqueDeshabilitado : undefined} pointerEvents={horarioBloqueado ? 'none' : 'auto'}>
                <DatePickerField
                  label="Fecha (un solo día)"
                  onChange={setFecha}
                  value={fecha}
                />

                <View style={styles.filaHoras}>
                  <View style={styles.colHora}>
                    <HoraPickerField
                      deshabilitado={horarioBloqueado}
                      label="Hora de inicio"
                      onChange={setHoraInicio}
                      value={horaInicio}
                    />
                  </View>
                  <View style={styles.colHora}>
                    <HoraPickerField
                      deshabilitado={horarioBloqueado}
                      error={errorHoraFin}
                      label="Hora de fin"
                      onChange={setHoraFin}
                      value={horaFin}
                    />
                  </View>
                </View>
              </View>

              {gpsActivo ? (
                <View style={styles.bloqueGps}>
                  <Text style={styles.etiquetaGps}>Ubicación de la jornada</Text>
                  <Text style={styles.ayudaGps}>
                    Los participantes deben estar a 100 m o menos de este punto al escanear el QR.
                  </Text>

                  {refUbicacionEn ? (
                    <View style={styles.estadoGpsFijado}>
                      <Icono color={forma.mintInk} nombre="lugar" tamano={18} />
                      <Text style={styles.textoGpsFijado}>
                        Ubicación fijada · precisión {precisionMetros} m ·{' '}
                        {horaEnZona(refUbicacionEn).slice(0, 5)}
                      </Text>
                    </View>
                  ) : null}

                  {errorGps ? (
                    <Aviso
                      accion={
                        <Boton
                          onPress={solicitarCapturaGps}
                          tamano="sm"
                          titulo="Reintentar"
                          variante="secundario"
                        />
                      }
                      texto={errorGps}
                      tipo="error"
                    />
                  ) : null}

                  <Boton
                    cargando={capturandoGps}
                    icono="lugar"
                    onPress={solicitarCapturaGps}
                    titulo={refUbicacionEn ? 'Volver a capturar' : 'Capturar ubicación actual'}
                    variante="secundario"
                  />
                </View>
              ) : null}
              </View>
            </>
          ) : null}
        </ScrollView>

        {estadoVista === 'normal' ? (
          <PieAccion>
            <Boton
              cargando={enviando}
              onPress={manejarGuardar}
              titulo={esEdicion ? 'Guardar cambios' : 'Crear jornada'}
            />
          </PieAccion>
        ) : null}
      </KeyboardAvoidingView>

      <HojaAcciones
        acciones={[
          {
            etiqueta: 'Usar ubicación actual (12 m)',
            icono: 'lugar',
            onPress: () => void ejecutarCapturaGps('dentro_radio'),
          },
          {
            etiqueta: 'Simular permiso denegado',
            icono: 'alerta',
            peligro: true,
            onPress: () => void ejecutarCapturaGps('sin_permiso'),
          },
        ]}
        onCerrar={() => setHojaGpsAbierta(false)}
        visible={hojaGpsAbierta}
      />
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
  tarjetaFormulario: {
    backgroundColor: colores.superficie,
    borderRadius: radios.superficie,
    gap: espaciados.md,
    padding: espaciados.lg,
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
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  espacioDerecha: {
    width: 44,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxxl,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  tarjetaInfo: {
    alignItems: 'flex-start',
    backgroundColor: colores.infoSuave,
    borderColor: colores.azulBorde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espaciados.sm,
    padding: espaciados.md,
  },
  tarjetaInfoTexto: {
    flex: 1,
    gap: 2,
  },
  tituloInfo: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
  },
  subtituloInfo: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  bloqueDeshabilitado: {
    gap: espaciados.lg,
    opacity: 0.65,
  },
  filaHoras: {
    flexDirection: 'row',
    gap: espaciados.md,
    marginTop: espaciados.md,
  },
  colHora: {
    flex: 1,
  },
  bloqueGps: {
    backgroundColor: forma.canvas,
    borderRadius: radios.md,
    gap: espaciados.sm,
    padding: espaciados.md,
  },
  etiquetaGps: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpoSm,
  },
  ayudaGps: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  estadoGpsFijado: {
    alignItems: 'center',
    backgroundColor: forma.mint,
    borderRadius: radios.sm,
    flexDirection: 'row',
    gap: espaciados.sm,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  textoGpsFijado: {
    color: forma.mintInk,
    flex: 1,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpoSm,
  },
});
