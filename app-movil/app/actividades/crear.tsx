import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { agregarActividad } from '@/lib/mockStore';
import { colores, espaciados, radios, tipografia } from '@/lib/tema';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

type Errores = {
  titulo?: string;
  descripcion?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  ubicacion?: string;
};

export default function CrearActividadScreen() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [ubicacion, setUbicacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState('');

  const limpiarError = (campo: keyof Errores) => {
    setErrores((previos) => (previos[campo] ? { ...previos, [campo]: undefined } : previos));
    if (errorGeneral) {
      setErrorGeneral('');
    }
  };

  const manejarGuardar = () => {
    const nuevos: Errores = {};

    if (!titulo.trim()) {
      nuevos.titulo = 'Escribe un título para la jornada.';
    }
    if (!descripcion.trim()) {
      nuevos.descripcion = 'Describe brevemente el objetivo de la jornada.';
    }
    if (!ubicacion.trim()) {
      nuevos.ubicacion = 'Indica dónde se realiza la jornada.';
    }
    if (!fecha) {
      nuevos.fecha = 'Selecciona una fecha.';
    }

    const inicioValido = REGEX_HORA.test(horaInicio.trim());
    const finValido = REGEX_HORA.test(horaFin.trim());

    if (!inicioValido) {
      nuevos.horaInicio = 'Usa el formato 24 h HH:mm. Ejemplo: 08:00.';
    }
    if (!finValido) {
      nuevos.horaFin = 'Usa el formato 24 h HH:mm. Ejemplo: 11:00.';
    } else if (inicioValido && horaFin.trim() <= horaInicio.trim()) {
      nuevos.horaFin = 'La hora de fin debe ser mayor que la de inicio.';
    }

    if (Object.keys(nuevos).length > 0) {
      setErrores(nuevos);
      setErrorGeneral('Revisa los campos marcados antes de continuar.');
      return;
    }

    setErrores({});
    setErrorGeneral('');

    agregarActividad({
      title: titulo,
      description: descripcion,
      date: fecha,
      startTime: horaInicio,
      endTime: horaFin,
      location: ubicacion,
    });

    router.back();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior titulo="Nueva jornada" />
      <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.encabezado}>
          <Text style={styles.subtitulo}>
            Define la fecha, el horario y el lugar. Después podrás pasar lista.
          </Text>
        </View>

        <View style={styles.tarjeta}>
          {errorGeneral ? <Aviso texto={errorGeneral} tipo="error" /> : null}

          <CampoTexto
            error={errores.titulo}
            etiqueta="Título"
            onChangeText={(valor) => {
              setTitulo(valor);
              limpiarError('titulo');
            }}
            placeholder="Ej. Jornada de limpieza comunitaria"
            value={titulo}
          />

          <CampoTexto
            error={errores.descripcion}
            etiqueta="Descripción"
            multilinea
            numberOfLines={3}
            onChangeText={(valor) => {
              setDescripcion(valor);
              limpiarError('descripcion');
            }}
            placeholder="Describe brevemente el objetivo de la jornada"
            value={descripcion}
          />

          <DatePickerField
            error={errores.fecha}
            label="Fecha"
            onChange={(valor) => {
              setFecha(valor);
              limpiarError('fecha');
            }}
            value={fecha}
          />

          <View style={styles.filaHoras}>
            <View style={styles.mitad}>
              <CampoTexto
                error={errores.horaInicio}
                etiqueta="Hora inicio"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                onChangeText={(valor) => {
                  setHoraInicio(valor);
                  limpiarError('horaInicio');
                }}
                placeholder="08:00"
                value={horaInicio}
              />
            </View>

            <View style={styles.mitad}>
              <CampoTexto
                error={errores.horaFin}
                etiqueta="Hora fin"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                onChangeText={(valor) => {
                  setHoraFin(valor);
                  limpiarError('horaFin');
                }}
                placeholder="11:00"
                value={horaFin}
              />
            </View>
          </View>

          <CampoTexto
            error={errores.ubicacion}
            etiqueta="Ubicación"
            onChangeText={(valor) => {
              setUbicacion(valor);
              limpiarError('ubicacion');
            }}
            placeholder="Ej. Casa Comunal, Sector Norte"
            value={ubicacion}
          />

          <Boton estilo={styles.botonGuardar} onPress={manejarGuardar} titulo="Crear jornada" />
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
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  presionado: {
    opacity: 0.7,
  },
  encabezado: {
    gap: espaciados.xs,
  },
  subtitulo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  filaHoras: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  mitad: {
    flex: 1,
  },
  botonGuardar: {
    marginTop: espaciados.xs,
  },
});
