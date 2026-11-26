import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

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
  | 'sinEventos';

const NOMBRES: Record<NombreIcono, SymbolViewProps['name']> = {
  inicio: { ios: 'house.fill', android: 'home', web: 'home' },
  cuenta: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  nueva: { ios: 'plus', android: 'add', web: 'add' },
  filtro: { ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' },
  volver: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  cerrar: { ios: 'xmark', android: 'close', web: 'close' },
  avanzar: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  calendario: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  lugar: { ios: 'mappin.and.ellipse', android: 'place', web: 'place' },
  gente: { ios: 'person.2', android: 'group', web: 'group' },
  camara: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  reloj: { ios: 'clock', android: 'schedule', web: 'schedule' },
  alerta: { ios: 'exclamationmark.triangle', android: 'error', web: 'error' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  hecho: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  sinEventos: { ios: 'calendar.badge.exclamationmark', android: 'event_busy', web: 'event_busy' },
};

export interface IconoProps {
  nombre: NombreIcono;
  color: string;
  tamano?: number;
  estilo?: StyleProp<ViewStyle>;
}

/**
 * Icono de línea único de la app. Es decorativo por defecto: el texto o el
 * `accessibilityLabel` del control que lo contiene comunican el significado.
 */
export function Icono({ nombre, color, tamano = 20, estilo }: IconoProps) {
  return (
    <SymbolView
      accessible={false}
      name={NOMBRES[nombre]}
      size={tamano}
      style={estilo}
      tintColor={color}
    />
  );
}
