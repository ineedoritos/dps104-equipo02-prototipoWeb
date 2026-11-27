import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Estado, type TonoEstado } from '@/components/ui/Estado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { Seccion } from '@/components/ui/Seccion';
import { formatearDia, horaEnZona } from '@/lib/fecha';
import {
  agruparJornadas,
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadasDeGrupo,
  obtenerMiRolEnGrupo,
  suscribirStore,
} from '@/lib/gruposStore';
import {cifrasTabulares, colores, espaciados, fuentes, radios, tipografia} from '@/lib/tema';
import type { EstadoJornada, Grupo, Jornada, RolGrupo } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

const MAPA_ESTADO_JORNADA: Record<EstadoJornada, { tono: TonoEstado; etiqueta: string }> = {
  en_curso: { tono: 'enCurso', etiqueta: 'En curso' },
  programada: { tono: 'programada', etiqueta: 'Programada' },
  finalizada: { tono: 'completada', etiqueta: 'Finalizada' },
  cancelada: { tono: 'cancelada', etiqueta: 'Cancelada' },
};

function formatearHoraCorta(iso: string): string {
  return horaEnZona(iso).slice(0, 5);
}

export default function GrupoDetalleScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const [grupo, setGrupo] = useState<Grupo | undefined>(() =>
    grupoId ? obtenerGrupoPorId(grupoId) : undefined,
  );
  const [rol, setRol] = useState<RolGrupo | null>(() =>
    grupoId ? obtenerMiRolEnGrupo(grupoId) : null,
  );
  const [jornadas, setJornadas] = useState<Jornada[]>(() =>
    grupoId ? obtenerJornadasDeGrupo(grupoId) : [],
  );
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refrescando, setRefrescando] = useState(false);

  const recargar = useCallback(() => {
    if (!grupoId) {
      return;
    }
    setGrupo(obtenerGrupoPorId(grupoId));
    setRol(obtenerMiRolEnGrupo(grupoId));
    setJornadas(obtenerJornadasDeGrupo(grupoId));
  }, [grupoId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
      return suscribirStore(recargar);
    }, [recargar]),
  );

  const manejarRefresh = () => {
    setRefrescando(true);
    setTimeout(() => {
      setEstadoVista('normal');
      recargar();
      setRefrescando(false);
    }, 250);
  };

  if (!grupo || !rol) {
    return (
      <View style={styles.pantalla}>
        <View style={styles.contenido}>
          <Aviso
            accion={
              <View style={styles.accionesErrorGrupo}>
                {grupoId ? (
                  <Boton
                    onPress={() =>
                      router.replace({
                        pathname: '/(tabs)/historial',
                        params: { grupoId },
                      })
                    }
                    tamano="sm"
                    titulo="Ir a Mi historial"
                    variante="primario"
                  />
                ) : null}
                <Boton
                  onPress={() => router.replace('/(tabs)')}
                  tamano="sm"
                  titulo="Ir a Mis grupos"
                  variante="secundario"
                />
              </View>
            }
            texto="Ya no eres integrante activo de este grupo o no está disponible. Puedes consultar tus registros anteriores en Mi historial."
            tipo="error"
          />
        </View>
      </View>
    );
  }

  const esResponsable = rol === 'responsable';
  const resumenConfig = `${
    grupo.modalidad_asistencia === 'qr' ? 'Asistencia por QR' : 'Asistencia manual'
  } · ${grupo.control_horas ? 'con control de horas' : 'sin control de horas'}`;

  const listaJornadas = estadoVista === 'vacio' ? [] : jornadas;
  const agrupadas = agruparJornadas(listaJornadas);

  const renderTarjetaJornada = (jornada: Jornada) => {
    const estado = derivarEstadoJornada(jornada);
    const metaEstado = MAPA_ESTADO_JORNADA[estado];
    const fechaTexto = formatearDia(jornada.inicio_en.slice(0, 10), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const esAhoraConQR =
      !esResponsable &&
      estado === 'en_curso' &&
      jornada.modalidad_asistencia === 'qr' &&
      !jornada.cancelada;

    return (
      <Pressable
        key={jornada.id}
        accessibilityRole="button"
        onPress={() => {
          if (esResponsable) {
            router.push({
              pathname: '/grupos/[grupoId]/jornadas/[jornadaId]',
              params: { grupoId: grupo.id, jornadaId: jornada.id },
            });
          } else {
            router.push({
              pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro',
              params: { grupoId: grupo.id, jornadaId: jornada.id },
            });
          }
        }}
        style={({ pressed }) => [
          styles.tarjetaJornada,
          esAhoraConQR && styles.tarjetaDestacada,
          pressed && styles.tarjetaPresionada,
        ]}
      >
        <View style={styles.filaSuperior}>
          <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
          <Estado etiqueta={metaEstado.etiqueta} tono={metaEstado.tono} />
        </View>

        <View style={styles.filaMeta}>
          <Icono color={colores.tintaSuave} nombre="reloj" tamano={15} />
          <Text style={[styles.textoHorario, cifrasTabulares]}>
            {fechaTexto} · {formatearHoraCorta(jornada.inicio_en)} – {formatearHoraCorta(jornada.fin_en)}
          </Text>
        </View>

        {jornada.cancelada ? (
          <Text style={styles.notaCancelada}>Sus registros no cuentan en los totales.</Text>
        ) : null}

        {esAhoraConQR ? (
          <View style={styles.pieDestacado}>
            <Boton
              icono="camara"
              onPress={() =>
                router.push({
                  pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/escanear-qr',
                  params: { grupoId: grupo.id, jornadaId: jornada.id },
                })
              }
              tamano="sm"
              titulo="Escanear QR"
            />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.pantalla}>

      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl
            colors={[colores.acento]}
            onRefresh={manejarRefresh}
            refreshing={refrescando}
            tintColor={colores.acento}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cabeceraGrupo}>
          <View style={styles.filaRol}>
            <View
              style={[
                styles.pildoraRol,
                esResponsable ? styles.pildoraResponsable : styles.pildoraParticipante,
              ]}
            >
              <Text
                style={[
                  styles.textoRol,
                  esResponsable ? styles.textoResponsable : styles.textoParticipante,
                ]}
              >
                {esResponsable ? 'Responsable' : 'Participante'}
              </Text>
            </View>
            <Text style={styles.resumenConfig}>{resumenConfig}</Text>
          </View>
        </View>


        {estadoVista === 'cargando' ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator color={colores.acento} size="large" />
            <Text style={styles.textoCarga}>Cargando jornadas…</Text>
          </View>
        ) : null}

        {estadoVista === 'error' ? (
          <Aviso
            accion={
              <Boton
                onPress={() => {
                  setEstadoVista('normal');
                  recargar();
                }}
                tamano="sm"
                titulo="Reintentar"
                variante="secundario"
              />
            }
            texto="No pudimos cargar las jornadas del grupo. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista !== 'cargando' && estadoVista !== 'error' && listaJornadas.length === 0 ? (
          <EstadoVacio
            accion={
              esResponsable ? (
                <Boton
                  icono="nueva"
                  onPress={() =>
                    router.push({
                      pathname: '/grupos/[grupoId]/jornadas/crear',
                      params: { grupoId: grupo.id },
                    })
                  }
                  titulo="Nueva jornada"
                />
              ) : undefined
            }
            descripcion="Cuando se programe una jornada en este grupo aparecerá aquí."
            icono="calendario"
            titulo="Aún no hay jornadas publicadas en este grupo."
          />
        ) : null}

        {estadoVista === 'normal' && listaJornadas.length > 0 ? (
          <View style={styles.gruposJornadas}>
            {agrupadas.hoy.length > 0 ? (
              <Seccion titulo="Hoy">
                <View style={styles.lista}>{agrupadas.hoy.map(renderTarjetaJornada)}</View>
              </Seccion>
            ) : null}

            {agrupadas.proximas.length > 0 ? (
              <Seccion titulo="Próximas">
                <View style={styles.lista}>{agrupadas.proximas.map(renderTarjetaJornada)}</View>
              </Seccion>
            ) : null}

            {agrupadas.anteriores.length > 0 ? (
              <Seccion titulo="Anteriores y canceladas">
                <View style={styles.lista}>{agrupadas.anteriores.map(renderTarjetaJornada)}</View>
              </Seccion>
            ) : null}
          </View>
        ) : null}

        {esResponsable && estadoVista === 'normal' && listaJornadas.length > 0 ? (
          <Boton
            icono="nueva"
            onPress={() =>
              router.push({
                pathname: '/grupos/[grupoId]/jornadas/crear',
                params: { grupoId: grupo.id },
              })
            }
            titulo="Nueva jornada"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  // Boton redondo de Forma: relleno `fill`, sin borde, area tactil de 44 px.
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  cabeceraGrupo: {
    gap: espaciados.xs,
  },
  filaRol: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
  },
  pildoraRol: {
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  pildoraResponsable: {
    backgroundColor: colores.acentoSuave,
  },
  pildoraParticipante: {
    backgroundColor: colores.completadaSuave,
  },
  textoRol: {
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
  },
  textoResponsable: {
    color: colores.acento,
  },
  textoParticipante: {
    color: colores.completada,
  },
  resumenConfig: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
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
  gruposJornadas: {
    gap: espaciados.lg,
  },
  lista: {
    gap: espaciados.md,
  },
  tarjetaJornada: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  tarjetaPresionada: {
    backgroundColor: colores.superficieAlt,
  },
  filaSuperior: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  tituloJornada: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.fuerte,
  },
  filaMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  textoHorario: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  notaCancelada: {
    color: colores.ausente,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  tarjetaDestacada: {
    borderColor: colores.acentoBorde,
    borderWidth: 1.5,
  },
  pieDestacado: {
    marginTop: espaciados.xs,
  },
  accionesErrorGrupo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
  },
});
