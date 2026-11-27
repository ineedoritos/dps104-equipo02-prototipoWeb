"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ItemNavegacion {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  soloResponsable?: boolean;
}

const ITEMS_NAVEGACION: readonly ItemNavegacion[] = [
  {
    href: "/grupos",
    etiqueta: "Grupos",
    icono: Users,
  },
  {
    href: "/dashboard",
    etiqueta: "Resumen",
    icono: BarChart3,
    soloResponsable: true,
  },
  {
    href: "/reportes",
    etiqueta: "Reportes",
    icono: ClipboardList,
    soloResponsable: true,
  },
  {
    href: "/jornadas",
    etiqueta: "Jornadas",
    icono: CalendarDays,
    soloResponsable: true,
  },
  {
    href: "/mi-reporte",
    etiqueta: "Mi reporte",
    icono: UserCheck,
  },
];

interface ListaNavegacionProps {
  esResponsable: boolean;
  colapsado?: boolean;
  alNavegar?: () => void;
}

export function ListaNavegacion({
  esResponsable,
  colapsado = false,
  alNavegar,
}: ListaNavegacionProps) {
  const pathname = usePathname();
  const items = ITEMS_NAVEGACION.filter(
    (item) => !item.soloResponsable || esResponsable,
  );

  return (
    <nav className="flex flex-col gap-1 px-2 py-3" aria-label="Navegación principal">
      {items.map((item) => {
        const Icono = item.icono;
        const paginaActual = pathname === item.href;
        const activo = paginaActual || pathname.startsWith(`${item.href}/`);

        const enlace = (
          <Link
            key={item.href}
            href={item.href}
            onNavigate={alNavegar}
            aria-label={colapsado ? item.etiqueta : undefined}
            aria-current={paginaActual ? "page" : activo ? "location" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors",
              activo
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              colapsado && "justify-center px-2",
            )}
          >
            <Icono aria-hidden="true" className="h-4 w-4 shrink-0" />
            {!colapsado && <span className="truncate">{item.etiqueta}</span>}
          </Link>
        );

        if (colapsado) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={enlace} />
              <TooltipContent side="right">{item.etiqueta}</TooltipContent>
            </Tooltip>
          );
        }

        return enlace;
      })}
    </nav>
  );
}
