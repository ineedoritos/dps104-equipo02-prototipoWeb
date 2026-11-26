import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

export type NombreIcono =
  | 'inicio'
  | 'cuenta'
  | 'nueva'
  | 'filtro'
  | 'volver'
  | 'cerrar'
  | 'avanzar'
  | 'calendario'
  | 'lugar'
  | 'gente'
  | 'camara'
  | 'reloj'
  | 'alerta'
  | 'info'
  | 'hecho'
  | 'sinEventos'
  | 'qr'
  | 'qrScanner'
  | 'lista'
  | 'editar'
  | 'guardar'
  | 'salir'
  | 'entrar'
  | 'agregarPersona'
  | 'reintentar'
  | 'reporte'
  | 'ajustes';

type NombreMaterialIcon = ComponentProps<typeof MaterialIcons>['name'];

const NOMBRES: Record<NombreIcono, NombreMaterialIcon> = {
  inicio: 'home',
  cuenta: 'account-circle',
  nueva: 'add',
  filtro: 'filter-list',
  volver: 'arrow-back',
  cerrar: 'close',
  avanzar: 'chevron-right',
  calendario: 'calendar-today',
  lugar: 'place',
  gente: 'group',
  camara: 'photo-camera',
  reloj: 'schedule',
  alerta: 'error-outline',
  info: 'info-outline',
  hecho: 'check-circle-outline',
  sinEventos: 'event-busy',
  qr: 'qr-code-2',
  qrScanner: 'qr-code-scanner',
  lista: 'fact-check',
  editar: 'edit',
  guardar: 'save',
  salir: 'logout',
  entrar: 'login',
  agregarPersona: 'person-add',
  reintentar: 'refresh',
  reporte: 'bar-chart',
  ajustes: 'settings',
};

export interface IconoProps {
  nombre: NombreIcono;
  color: string;
  tamano?: number;
  estilo?: StyleProp<TextStyle>;
}

/**
 * Icono único de la app basado en `@expo/vector-icons` (`MaterialIcons`).
 * Es decorativo por defecto: el texto o el `accessibilityLabel` del control
 * que lo contiene comunican el significado.
 */
export function Icono({ nombre, color, tamano = 20, estilo }: IconoProps) {
  return (
    <MaterialIcons
      accessible={false}
      color={color}
      name={NOMBRES[nombre]}
      size={tamano}
      style={estilo}
    />
  );
}
