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
import { rutaPortal, useContextoPortal } from "@/components/layout/contexto-portal";
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
  colapsado?: boolean;
  inferior?: boolean;
}

export function ListaNavegacion({
  colapsado = false,
  inferior = false,
}: ListaNavegacionProps) {
  const { contextoActivo } = useContextoPortal();
  const esResponsable = contextoActivo?.rol === "responsable";
  const pathname = usePathname();
  const items = ITEMS_NAVEGACION.filter(
    (item) => (!item.soloResponsable || esResponsable) &&
      !(inferior && esResponsable && item.href === "/grupos"),
  );

  return (
    <nav
      className={inferior
        ? "flex w-full gap-1.5 rounded-[34px] bg-forma-paper p-1.5"
        : "flex flex-col gap-1 px-2 py-3"}
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const Icono = item.icono;
        const paginaActual = pathname === item.href;
        const activo = paginaActual || pathname.startsWith(`${item.href}/`);

        const enlace = (
          <Link
            key={item.href}
            href={rutaPortal(item.href, contextoActivo?.id)}
            aria-label={colapsado ? item.etiqueta : undefined}
            aria-current={paginaActual ? "page" : activo ? "location" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-full px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors",
              activo
                ? "bg-forma-canvas font-semibold text-forma-ink"
                : "text-forma-muted hover:bg-forma-fill hover:text-forma-ink",
              inferior && "min-h-14 min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-[28px] px-1 py-1 text-[11px] leading-tight",
              colapsado && "justify-center px-2",
            )}
          >
            <Icono aria-hidden="true" size={20} strokeWidth={activo ? 2.1 : 1.8} className="shrink-0" />
            {!colapsado && <span className="max-w-full truncate">{item.etiqueta}</span>}
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
