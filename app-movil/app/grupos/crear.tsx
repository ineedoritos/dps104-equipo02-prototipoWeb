import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Icono } from '@/components/ui/Icono';
import { crearGrupo } from '@/lib/gruposStore';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
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
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.pantalla}
      >
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.botonVolver}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.tituloBarra}>
            Crear grupo
          </Text>
          <View style={styles.espacioDerecha} />
        </View>

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
    fontWeight: pesos.fuerte,
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
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
});
