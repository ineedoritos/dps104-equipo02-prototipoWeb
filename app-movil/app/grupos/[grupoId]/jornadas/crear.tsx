import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { HoraPickerField } from '@/components/ui/HoraPickerField';
import { Icono } from '@/components/ui/Icono';
import { fechaEnZona, horaEnZona } from '@/lib/fecha';
import {
  crearJornada,
  editarJornada,
  jornadaTieneRegistros,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
} from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

export default function CrearOEditarJornadaScreen() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const horasEnColumna = width < 380 || fontScale > 1.3;
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
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');

  if (!grupo || rol !== 'responsable' || (jornadaId && !jornadaExistente)) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Jornada" />
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

  const modalidadTexto =
    grupo.modalidad_asistencia === 'qr' ? 'Asistencia por QR' : 'Asistencia manual';
  const horasTexto = grupo.control_horas ? 'con control de horas' : 'sin control de horas';

  const errorHoraFin =
    !horarioBloqueado && horaFin <= horaInicio
      ? 'La hora de fin debe ser posterior a la de inicio.'
      : undefined;

  const manejarGuardar = () => {
    setErrorGeneral('');

    setIntentoGuardar(true);
    if (!titulo.trim() || !descripcion.trim() || !fecha.trim() || errorHoraFin) return;

    setEnviando(true);
    try {
      const resultado = esEdicion && jornadaExistente
        ? editarJornada(jornadaExistente.id, {
            titulo,
            descripcion,
            fecha,
            horaInicio,
            horaFin,
          })
        : crearJornada(grupo.id, {
            titulo,
            descripcion,
            fecha,
            horaInicio,
            horaFin,
          });

      const detalle = {
        pathname: '/grupos/[grupoId]/jornadas/[jornadaId]',
        params: { grupoId: grupo.id, jornadaId: resultado.id },
      } as const;
      if (esEdicion) {
        router.dismissTo(detalle);
      } else {
        router.replace(detalle);
      }
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
      <BarraSuperior titulo={esEdicion ? 'Editar jornada' : 'Nueva jornada'} />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {mostrarControlesDePrueba ? (
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
                  {modalidadTexto} · {horasTexto}
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

            <View style={styles.panelFormulario}>
              <CampoTexto
                error={intentoGuardar && !titulo.trim() ? 'Ingresa un título para la jornada.' : undefined}
                etiqueta="Título"
                onChangeText={setTitulo}
                placeholder="Ej. Entrega de paquetes alimentarios"
                value={titulo}
              />

              <CampoTexto
                error={intentoGuardar && !descripcion.trim() ? 'Describe la actividad en unas palabras.' : undefined}
                etiqueta="Descripción"
                multilinea
                numberOfLines={3}
                onChangeText={setDescripcion}
                placeholder="Describe qué actividad se realizará"
                value={descripcion}
              />
            </View>

            <View style={styles.panelFormulario}>
              <Text accessibilityRole="header" style={styles.tituloSeccion}>Fecha y horario</Text>
              <DatePickerField
                deshabilitado={horarioBloqueado}
                error={intentoGuardar && !fecha.trim() ? 'Selecciona la fecha de la jornada.' : undefined}
                label="Fecha"
                onChange={setFecha}
                permitirLimpiar={false}
                value={fecha}
              />

              <View style={[styles.filaHoras, horasEnColumna && styles.horasEnColumna]}>
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
                    error={intentoGuardar ? errorHoraFin : undefined}
                    label="Hora de fin"
                    onChange={setHoraFin}
                    value={horaFin}
                  />
                </View>
              </View>
            </View>

            <Boton
              cargando={enviando}
              onPress={manejarGuardar}
              titulo={esEdicion ? 'Guardar cambios' : 'Crear jornada'}
            />
          </>
        ) : null}
      </ScrollView>
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
  contenido: {
    alignSelf: 'center',
    maxWidth: 560,
    width: '100%',
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
    fontWeight: pesos.fuerte,
  },
  subtituloInfo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  panelFormulario: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  tituloSeccion: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  filaHoras: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  horasEnColumna: {
    flexDirection: 'column',
  },
  colHora: {
    flex: 1,
  },
});
