import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { crearGrupo } from '@/lib/gruposStore';
import { colores, espaciados, radios } from '@/lib/tema';
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
      <BarraSuperior titulo="Crear grupo" />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
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

        <Boton cargando={cargando} icono="nueva" onPress={manejarCrear} titulo="Crear grupo" />
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
