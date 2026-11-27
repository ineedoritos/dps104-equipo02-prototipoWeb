import { Encabezado } from '@/components/ui/Encabezado';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { crearGrupo } from '@/lib/gruposStore';
import { colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

export default function CrearGrupoScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarCrear = () => {
    setErrorGeneral('');
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setErrorNombre('Escribe el nombre del grupo.');
      return;
    }

    setErrorNombre('');
    setCargando(true);

    setTimeout(() => {
      try {
        const nuevo = crearGrupo({
          nombre: nombreLimpio,
          descripcion,
        });
        setCargando(false);
        router.replace(`/grupos/${nuevo.id}` as Href);
      } catch (err) {
        setCargando(false);
        if (err instanceof ErrorDominio) {
          setErrorGeneral(err.message);
        } else {
          setErrorGeneral('No pudimos crear el grupo. Intenta de nuevo.');
        }
      }
    }, 200);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.pantalla}
      >
        <Encabezado onVolver={() => router.back()} titulo="Crear grupo" />

        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          {errorGeneral ? (
            <Aviso
              accion={<Boton onPress={manejarCrear} tamano="sm" titulo="Reintentar" variante="secundario" />}
              texto={errorGeneral}
              tipo="error"
            />
          ) : null}

          <View style={styles.tarjeta}>
            <CampoTexto
              error={errorNombre}
              etiqueta="Nombre del grupo"
              onChangeText={(valor) => {
                setNombre(valor);
                if (errorNombre) setErrorNombre('');
              }}
              placeholder="Ej. Banco de Alimentos"
              value={nombre}
            />

            <CampoTexto
              etiqueta="Descripción (opcional)"
              multiline
              numberOfLines={3}
              onChangeText={setDescripcion}
              placeholder="¿Qué actividad realiza este grupo?"
              value={descripcion}
            />
          </View>

          <Aviso
            texto="Quedarás como responsable. Después podrás agregar integrantes y elegir cómo se registra la asistencia."
            tipo="info"
          />

          <Boton cargando={cargando} onPress={manejarCrear} titulo="Crear grupo" />
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
  barraSuperior: {
    alignItems: 'center',
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  botonVolver: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tituloBarra: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  espacioDerecha: {
    width: 40,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
});
