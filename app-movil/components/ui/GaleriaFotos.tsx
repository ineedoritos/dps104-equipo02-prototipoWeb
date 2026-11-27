import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/Icono';
import { formatearFecha, horaEnZona } from '@/lib/fecha';
import { obtenerNombreAutorFoto, resolverImagenEvidencia } from '@/lib/fotosStore';
import {
  cifrasTabulares,
  espaciados,
  forma,
  fuentes,
  interletrado,
  radios,
  tamanos,
  tipografia,
} from '@/lib/tema';
import type { FotoJornada } from '@/types/dominio';

export interface GaleriaFotosProps {
  fotos: FotoJornada[];
  puedeAgregar: boolean;
  esResponsable: boolean;
  motivoBloqueoAgregar?: string;
  cargandoAgregar?: boolean;
  onAgregarFoto: () => void;
  onRetirarFoto: (fotoId: string) => void;
}

export function GaleriaFotos({
  fotos,
  puedeAgregar,
  esResponsable,
  motivoBloqueoAgregar,
  cargandoAgregar = false,
  onAgregarFoto,
  onRetirarFoto,
}: GaleriaFotosProps) {
  const { width } = useWindowDimensions();
  const [fotoActiva, setFotoActiva] = useState<FotoJornada | null>(null);
  const [confirmarRetiro, setConfirmarRetiro] = useState(false);

  const anchoContenedor = Math.max(240, width - espaciados.lg * 2);
  const anchoCelda = Math.floor((anchoContenedor - espaciados.xs * 2) / 3);

  const cerrarModal = () => {
    setFotoActiva(null);
    setConfirmarRetiro(false);
  };

  const confirmarRetirarFoto = () => {
    if (!fotoActiva) {
      return;
    }
    const id = fotoActiva.id;
    cerrarModal();
    onRetirarFoto(id);
  };

  return (
    <View style={styles.contenedor}>
      {puedeAgregar || fotos.length > 0 ? (
        <View style={styles.cuadricula}>
          {puedeAgregar ? (
            <Pressable
              accessibilityLabel="Agregar foto"
              accessibilityRole="button"
              disabled={cargandoAgregar}
              onPress={onAgregarFoto}
              style={({ pressed }) => [
                styles.celdaAgregar,
                { height: anchoCelda, width: anchoCelda },
                pressed && styles.presionado,
              ]}
            >
              {cargandoAgregar ? (
                <ActivityIndicator color={forma.ink} size="small" />
              ) : (
                <>
                  <View style={styles.iconoAgregar}>
                    <Icono color={forma.ink} nombre="camara" tamano={21} />
                  </View>
                  <Text style={styles.textoAgregar}>Agregar foto</Text>
                </>
              )}
            </Pressable>
          ) : null}

          {fotos.map((foto) => {
            const autor = obtenerNombreAutorFoto(foto.autor_id);
            const fechaCorta = formatearFecha(foto.creado_en, {
              day: 'numeric',
              month: 'short',
            });
            const horaCorta = horaEnZona(foto.creado_en).slice(0, 5);

            return (
              <Pressable
                accessibilityLabel={`Ver foto de ${autor}, ${fechaCorta} ${horaCorta}`}
                accessibilityRole="button"
                key={foto.id}
                onPress={() => {
                  setConfirmarRetiro(false);
                  setFotoActiva(foto);
                }}
                style={({ pressed }) => [
                  styles.celdaFoto,
                  { width: anchoCelda },
                  pressed && styles.presionado,
                ]}
              >
                <Image
                  resizeMode="cover"
                  source={resolverImagenEvidencia(foto.ruta_storage)}
                  style={[styles.miniatura, { height: anchoCelda, width: anchoCelda }]}
                />
                <Text numberOfLines={1} style={styles.autorMini}>
                  {autor}
                </Text>
                <Text numberOfLines={1} style={[styles.fechaMini, cifrasTabulares]}>
                  {fechaCorta} · {horaCorta}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {fotos.length === 0 ? (
        <View style={styles.tarjetaVacia}>
          <Text style={styles.textoVacio}>Todavía no hay fotos de esta jornada.</Text>
        </View>
      ) : null}

      {!puedeAgregar && motivoBloqueoAgregar ? (
        <Text style={styles.motivoBloqueo}>{motivoBloqueoAgregar}</Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={cerrarModal}
        transparent
        visible={Boolean(fotoActiva)}
      >
        <View style={styles.veloModal}>
          <View style={styles.tarjetaModal}>
            <View style={styles.cabeceraModal}>
              <Text style={styles.tituloModal}>Foto de evidencia</Text>
              <Pressable
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
                onPress={cerrarModal}
                style={({ pressed }) => [styles.botonCerrar, pressed && styles.presionado]}
              >
                <Icono color={forma.ink} nombre="cerrar" tamano={20} />
              </Pressable>
            </View>

            {fotoActiva ? (
              <>
                <Image
                  resizeMode="cover"
                  source={resolverImagenEvidencia(fotoActiva.ruta_storage)}
                  style={styles.imagenAmpliada}
                />
                <View style={styles.metaModal}>
                  <Text style={styles.autorModal}>
                    {obtenerNombreAutorFoto(fotoActiva.autor_id)}
                  </Text>
                  <Text style={[styles.fechaModal, cifrasTabulares]}>
                    {formatearFecha(fotoActiva.creado_en, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {horaEnZona(fotoActiva.creado_en).slice(0, 5)}
                  </Text>
                </View>

                {esResponsable ? (
                  confirmarRetiro ? (
                    <View style={styles.cajaConfirmar}>
                      <Text style={styles.textoConfirmar}>
                        La foto deja de verse para el grupo. Las asistencias no cambian.
                      </Text>
                      <View style={styles.filaConfirmar}>
                        <View style={styles.colConfirmar}>
                          <Boton
                            onPress={() => setConfirmarRetiro(false)}
                            tamano="sm"
                            titulo="Cancelar"
                            variante="secundario"
                          />
                        </View>
                        <View style={styles.colConfirmar}>
                          <Boton
                            onPress={confirmarRetirarFoto}
                            tamano="sm"
                            titulo="Sí, retirar"
                            variante="peligro"
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Boton
                      icono="cancelar"
                      onPress={() => setConfirmarRetiro(true)}
                      titulo="Retirar foto"
                      variante="peligro"
                    />
                  )
                ) : null}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.sm,
  },
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  celdaAgregar: {
    alignItems: 'center',
    backgroundColor: forma.paper,
    borderRadius: radios.md,
    gap: espaciados.xs,
    justifyContent: 'center',
    padding: espaciados.sm,
  },
  iconoAgregar: {
    alignItems: 'center',
    backgroundColor: forma.fill,
    borderRadius: radios.pill,
    height: tamanos.objetivo,
    justifyContent: 'center',
    width: tamanos.objetivo,
  },
  textoAgregar: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.micro,
    textAlign: 'center',
  },
  celdaFoto: {
    gap: 2,
    marginBottom: espaciados.xs,
  },
  miniatura: {
    backgroundColor: forma.fill,
    borderRadius: radios.md,
  },
  autorMini: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.micro,
    marginTop: 2,
  },
  fechaMini: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  presionado: {
    transform: [{ scale: 0.98 }],
  },
  tarjetaVacia: {
    backgroundColor: forma.paper,
    borderRadius: radios.tarjeta,
    padding: espaciados.lg,
  },
  textoVacio: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  motivoBloqueo: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  veloModal: {
    alignItems: 'center',
    backgroundColor: forma.scrim,
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  tarjetaModal: {
    backgroundColor: forma.paper,
    borderRadius: radios.modal,
    gap: espaciados.md,
    padding: espaciados.xl,
    width: '100%',
  },
  cabeceraModal: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tituloModal: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
  },
  botonCerrar: {
    alignItems: 'center',
    backgroundColor: forma.fill,
    borderRadius: radios.pill,
    height: tamanos.objetivo,
    justifyContent: 'center',
    width: tamanos.objetivo,
  },
  imagenAmpliada: {
    aspectRatio: 1,
    backgroundColor: forma.fill,
    borderRadius: radios.lg,
    width: '100%',
  },
  metaModal: {
    gap: 2,
  },
  autorModal: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpo,
  },
  fechaModal: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  cajaConfirmar: {
    backgroundColor: forma.rose,
    borderRadius: radios.lg,
    gap: espaciados.md,
    padding: espaciados.md,
  },
  textoConfirmar: {
    color: forma.roseInk,
    fontFamily: fuentes.medio,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  filaConfirmar: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  colConfirmar: {
    flex: 1,
  },
});
