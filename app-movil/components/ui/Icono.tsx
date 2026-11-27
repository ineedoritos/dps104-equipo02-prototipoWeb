import {
  ArrowLeft,
  Ban,
  Calendar,
  Pencil,
  CalendarX,
  Camera,
  CircleCheck,
  CircleUser,
  ChartColumn,
  Clock,
  House,
  Info,
  ListFilter,
  MapPin,
  Plus,
  TriangleAlert,
  Users,
  X,
  ChevronRight,
  Ellipsis,
  Eye,
  EyeOff,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
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
  | 'sinEventos'
  | 'ver'
  | 'ocultar'
  | 'participante'
  | 'responsable'
  | 'ajustes'
  | 'reportes'
  | 'editar'
  | 'cancelar'
  | 'mas';

const ICONOS: Record<NombreIcono, LucideIcon> = {
  ver: Eye,
  ocultar: EyeOff,
  participante: User,
  responsable: ShieldCheck,
  ajustes: Settings,
  reportes: ChartColumn,
  editar: Pencil,
  cancelar: Ban,
  mas: Ellipsis,
  inicio: House,
  cuenta: CircleUser,
  nueva: Plus,
  filtro: ListFilter,
  volver: ArrowLeft,
  cerrar: X,
  avanzar: ChevronRight,
  calendario: Calendar,
  lugar: MapPin,
  gente: Users,
  camara: Camera,
  reloj: Clock,
  alerta: TriangleAlert,
  info: Info,
  hecho: CircleCheck,
  sinEventos: CalendarX,
};

/** Trazo de Forma: 1.8 en reposo, 2.1 para el estado activo. */
export const TRAZO_ICONO = { normal: 1.8, activo: 2.1 } as const;

export interface IconoProps {
  nombre: NombreIcono;
  color: string;
  /** Forma: 21 px por defecto, 20 en TabBar y Metric, 19 en botones y toasts. */
  tamano?: number;
  trazo?: number;
  estilo?: StyleProp<ViewStyle>;
}

/**
 * Icono de Forma: Lucide solo en contorno, trazo redondeado de 1.8.
 * Es decorativo: el texto o el `accessibilityLabel` del control que lo
 * contiene comunican el significado.
 */
export function Icono({ nombre, color, tamano = 21, trazo = TRAZO_ICONO.normal, estilo }: IconoProps) {
  const Componente = ICONOS[nombre];
  return (
    <Componente
      accessible={false}
      color={color}
      fill="none"
      importantForAccessibility="no-hide-descendants"
      size={tamano}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={trazo}
      style={estilo}
    />
  );
}
