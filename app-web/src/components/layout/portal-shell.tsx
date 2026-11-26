"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  User,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RolGrupo = "responsable" | "participante";

interface ContextoPortal {
  id: string;
  nombre: string;
  tipo: "grupo" | "personal";
  rol?: RolGrupo;
}

const CONTEXTOS_BASE: ContextoPortal[] = [
  {
    id: "grupo-voluntariado",
    nombre: "Brigada Universitaria UDB",
    tipo: "grupo",
    rol: "responsable",
  },
  {
    id: "grupo-deporte",
    nombre: "Club de Atletismo Campus",
    tipo: "grupo",
    rol: "participante",
  },
  {
    id: "personal",
    nombre: "Mi reporte personal",
    tipo: "personal",
  },
];

interface ItemNavegacion {
  href: string;
  etiqueta: string;
  icono: React.ComponentType<{ className?: string }>;
  soloResponsable?: boolean;
}

const ITEMS_NAVEGACION: ItemNavegacion[] = [
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
  items: ItemNavegacion[];
  pathname: string;
  colapsado?: boolean;
  alNavegar?: () => void;
}

function ListaNavegacion({
  items,
  pathname,
  colapsado = false,
  alNavegar,
}: ListaNavegacionProps) {
  return (
    <nav className="flex flex-col gap-1 px-2 py-3" aria-label="Navegación principal">
      {items.map((item) => {
        const Icono = item.icono;
        const activo =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        const enlace = (
          <Link
            key={item.href}
            href={item.href}
            onClick={alNavegar}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              colapsado && "justify-center px-2",
            )}
          >
            <Icono className="h-4 w-4 shrink-0" />
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

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [colapsado, setColapsado] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [contextoId, setContextoId] = useState<string>(CONTEXTOS_BASE[0].id);

  const contextoActivo =
    CONTEXTOS_BASE.find((item) => item.id === contextoId) ?? CONTEXTOS_BASE[0];

  const esResponsable =
    contextoActivo.tipo === "grupo" && contextoActivo.rol === "responsable";

  const itemsVisibles = ITEMS_NAVEGACION.filter(
    (item) => !item.soloResponsable || esResponsable,
  );

  function manejarCambioContexto(nuevoId: string | null) {
    if (!nuevoId) return;
    setContextoId(nuevoId);
    const seleccionado = CONTEXTOS_BASE.find((item) => item.id === nuevoId);
    if (seleccionado && seleccionado.rol !== "responsable") {
      router.push("/mi-reporte");
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
          colapsado ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "h-14 flex items-center border-b border-sidebar-border px-3",
            colapsado ? "justify-center" : "justify-between",
          )}
        >
          {!colapsado && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold tracking-tight text-foreground truncate"
            >
              Registro de actividades
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setColapsado((prev) => !prev)}
            aria-label={colapsado ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {colapsado ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ListaNavegacion
            items={itemsVisibles}
            pathname={pathname}
            colapsado={colapsado}
          />
        </div>

        {!colapsado && (
          <div className="border-t border-sidebar-border p-3 text-xs text-muted-foreground">
            Portal de consulta y reportería
          </div>
        )}
      </aside>

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Drawer móvil */}
            <Sheet open={menuMovilAbierto} onOpenChange={setMenuMovilAbierto}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    aria-label="Abrir menú de navegación"
                  />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-14 px-4 flex justify-center border-b border-border">
                  <SheetTitle className="text-sm font-semibold text-left">
                    Registro de actividades
                  </SheetTitle>
                </SheetHeader>
                <ListaNavegacion
                  items={itemsVisibles}
                  pathname={pathname}
                  alNavegar={() => setMenuMovilAbierto(false)}
                />
              </SheetContent>
            </Sheet>

            {/* Selector de grupo / modo personal */}
            <Select value={contextoId} onValueChange={manejarCambioContexto}>
              <SelectTrigger
                className="w-[220px] sm:w-[280px] bg-secondary"
                aria-label="Seleccionar grupo o vista personal"
              >
                <SelectValue placeholder="Selecciona un contexto" />
              </SelectTrigger>
              <SelectContent>
                {CONTEXTOS_BASE.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <span className="flex items-center gap-2">
                      <span className="truncate">{item.nombre}</span>
                      {item.rol && (
                        <Badge
                          variant={
                            item.rol === "responsable" ? "default" : "secondary"
                          }
                          className="text-[11px] font-medium"
                        >
                          {item.rol === "responsable"
                            ? "Responsable"
                            : "Participante"}
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                />
              }
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Cuenta</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium leading-none">
                      Sesión del portal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Zona horaria: El Salvador (UTC-6)
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/mi-reporte")}>
                <UserCheck className="mr-2 h-4 w-4" />
                <span>Mi reporte personal</span>
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => router.push("/login")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
