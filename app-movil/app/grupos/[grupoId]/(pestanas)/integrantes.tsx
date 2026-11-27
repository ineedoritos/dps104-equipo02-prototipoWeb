import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { SelectorTarjeta, type OpcionTarjeta } from '@/components/ui/SelectorTarjeta';
import {
  agregarIntegrantePorCorreo,
  cambiarRolIntegrante,
  obtenerGrupoPorId,
  obtenerIntegrantesActivos,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
  retirarIntegrante,
  suscribirStore,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import { ErrorDominio, type IntegranteConUsuario, type RolGrupo } from '@/types/dominio';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OPCIONES_ROL: OpcionTarjeta<RolGrupo>[] = [
  { valor: 'participante', titulo: 'Participante', icono: 'participante' },
  { valor: 'responsable', titulo: 'Responsable', icono: 'responsable' },
];

export default function IntegrantesScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const [integrantes, setIntegrantes] = useState<IntegranteConUsuario[]>(() =>
    grupoId ? obtenerIntegrantesActivos(grupoId) : [],
  );
  const [rolActual, setRolActual] = useState<RolGrupo | null>(() =>
    grupoId ? obtenerMiRolEnGrupo(grupoId) : null,
  );
  const [correoNuevo, setCorreoNuevo] = useState('');
  const [rolInicial, setRolInicial] = useState<RolGrupo>('participante');
  const [cargando, setCargando] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorAccion, setErrorAccion] = useState('');

  const sesion = obtenerSesionActual();
  // Uno no se administra a si mismo: para salir del grupo se usa Ajustes.
  const otrosIntegrantes = integrantes.filter((i) => i.usuario_id !== sesion?.id);
  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;

  const recargar = useCallback(() => {
    if (!grupoId) {
      return;
    }
    setIntegrantes(obtenerIntegrantesActivos(grupoId));
    setRolActual(obtenerMiRolEnGrupo(grupoId));
  }, [grupoId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
      return suscribirStore(recargar);
    }, [recargar]),
  );

  const manejarAgregar = () => {
    if (!grupoId) {
      return;
    }
    setErrorAccion('');
    const correoLimpio = correoNuevo.trim();
    if (!REGEX_CORREO.test(correoLimpio)) {
      setErrorCorreo('Ingresa un correo electrónico válido.');
      return;
    }

    setErrorCorreo('');
    setCargando(true);

    setTimeout(() => {
      try {
        agregarIntegrantePorCorreo(grupoId, correoLimpio, rolInicial);
        setCorreoNuevo('');
        setRolInicial('participante');
        setCargando(false);
        recargar();
      } catch (err) {
        setCargando(false);
        if (err instanceof ErrorDominio) {
          setErrorAccion(err.message);
        } else {
          setErrorAccion('No pudimos agregar a la persona. Intenta de nuevo.');
        }
      }
    }, 200);
  };

  const manejarCambiarRol = (integrante: IntegranteConUsuario, nuevoRol: RolGrupo) => {
    if (!grupoId || integrante.rol === nuevoRol) {
      return;
    }
    setErrorAccion('');
    try {
      cambiarRolIntegrante(grupoId, integrante.id, nuevoRol);
      recargar();
    } catch (err) {
      if (err instanceof ErrorDominio) {
        setErrorAccion(err.message);
      }
    }
  };

  const confirmarRetiro = (integrante: IntegranteConUsuario) => {
    if (!grupoId) {
      return;
    }
    Alert.alert(
      'Retirar integrante',
      `¿Seguro que quieres retirar a ${integrante.usuario.nombre}? Su historial se conservará.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar',
          style: 'destructive',
          onPress: () => {
            setErrorAccion('');
            try {
              retirarIntegrante(grupoId, integrante.id);
              recargar();
            } catch (err) {
              if (err instanceof ErrorDominio) {
                setErrorAccion(err.message);
              }
            }
          },
        },
      ],
    );
  };

  if (!grupo || rolActual !== 'responsable') {
    return (
      <View style={styles.pantalla}>
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
            texto="Solo un responsable activo puede administrar los integrantes del grupo."
            tipo="error"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {errorAccion ? <Aviso texto={errorAccion} tipo="error" /> : null}

        <View style={styles.tarjeta}>
          <Text style={styles.tituloBloque}>Agregar por correo</Text>

          <CampoTexto
            autoCapitalize="none"
            autoComplete="email"
            error={errorCorreo}
            etiqueta="Correo de cuenta existente"
            keyboardType="email-address"
            onChangeText={(valor) => {
              setCorreoNuevo(valor);
              if (errorCorreo) setErrorCorreo('');
            }}
            placeholder="persona@ejemplo.com"
            value={correoNuevo}
          />

          <SelectorTarjeta
            accessibilityLabel="Rol del nuevo integrante"
            onCambiar={setRolInicial}
            opciones={OPCIONES_ROL}
            valor={rolInicial}
          />

          <Boton cargando={cargando} onPress={manejarAgregar} titulo="Agregar" />
        </View>

        <View style={styles.encabezadoLista}>
          <Text style={[styles.contador, cifrasTabulares]}>
            {otrosIntegrantes.length}{' '}
            {otrosIntegrantes.length === 1 ? 'integrante además de ti' : 'integrantes además de ti'}
          </Text>
        </View>

        <View style={styles.lista}>
          {otrosIntegrantes.map((item) => {
            return (
              <View key={item.id} style={styles.tarjetaIntegrante}>
                <View style={styles.filaInfo}>
                  <View style={styles.datosPersona}>
                    <Text style={styles.nombrePersona}>{item.usuario.nombre}</Text>
                    <Text style={styles.correoPersona}>{item.usuario.correo}</Text>
                  </View>

                  <Pressable
                    accessibilityLabel={`Retirar a ${item.usuario.nombre}`}
                    accessibilityRole="button"
                    onPress={() => confirmarRetiro(item)}
                    style={styles.botonRetirar}
                  >
                    <Text style={styles.textoRetirar}>Retirar</Text>
                  </Pressable>
                </View>

                <SelectorTarjeta
                  accessibilityLabel={`Rol de ${item.usuario.nombre}`}
                  onCambiar={(nuevoRol) => manejarCambiarRol(item, nuevoRol)}
                  opciones={OPCIONES_ROL}
                  valor={item.rol}
                />
              </View>
            );
          })}
        </View>

        <Text style={styles.notaPie}>
          Un rol por grupo. Siempre debe quedar al menos un responsable. Al retirar a alguien, su
          historial se conserva. Para salir tú del grupo, ve a Ajustes.
        </Text>
      </ScrollView>
    </View>
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
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  tituloBloque: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  encabezadoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contador: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
  },
  lista: {
    gap: espaciados.md,
  },
  tarjetaIntegrante: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  filaInfo: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  datosPersona: {
    flex: 1,
    gap: 2,
  },
  nombrePersona: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.fuerte,
  },
  correoPersona: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  botonRetirar: {
    backgroundColor: colores.ausenteSuave,
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  textoRetirar: {
    color: colores.ausente,
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
    textAlign: 'center',
  },
});
