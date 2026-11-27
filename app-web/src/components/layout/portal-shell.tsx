"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { useContextoPortal } from "@/components/layout/contexto-portal";
import { ListaNavegacion } from "@/components/layout/lista-navegacion";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { contextoActivo, seleccionarPersonal } = useContextoPortal();
  const [colapsado, setColapsado] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const esResponsable =
    contextoActivo?.tipo === "grupo" && contextoActivo.rol === "responsable";

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:outline-2 focus:outline-ring"
        href="#contenido-principal"
      >
        Saltar al contenido
      </a>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
          colapsado ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex min-h-16 items-center gap-2 border-b border-sidebar-border px-3",
            colapsado ? "justify-center" : "justify-between",
          )}
        >
          {!colapsado && (
            <Link
              href="/grupos"
              className="min-w-0 truncate rounded-sm text-sm font-semibold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              Registro de actividades
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            onClick={() => setColapsado((prev) => !prev)}
            aria-label={colapsado ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {colapsado ? (
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            ) : (
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ListaNavegacion
            esResponsable={esResponsable}
            colapsado={colapsado}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-2 border-b border-border bg-card px-3 sm:gap-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sheet open={menuMovilAbierto} onOpenChange={setMenuMovilAbierto}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 md:hidden"
                    aria-label="Abrir menú de navegación"
                  />
                }
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="gap-0 overflow-y-auto overscroll-contain p-0 motion-reduce:transition-none"
              >
                <SheetHeader className="min-h-16 flex-row items-center justify-between gap-2 border-b border-border px-4 py-2">
                  <SheetTitle className="text-left text-sm font-semibold">
                    Registro de actividades
                  </SheetTitle>
                  <SheetClose
                    render={
                      <Button variant="ghost" size="icon" className="min-h-11 min-w-11" />
                    }
                    aria-label="Cerrar menú"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </SheetClose>
                </SheetHeader>
                <ListaNavegacion
                  esResponsable={esResponsable}
                  alNavegar={() => setMenuMovilAbierto(false)}
                />
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              className="h-auto min-h-11 min-w-0 max-w-96 shrink justify-between gap-2 bg-secondary px-3 py-1.5"
              nativeButton={false}
              render={<Link href="/grupos" />}
            >
              <span className="flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <span className="max-w-full truncate">
                  {contextoActivo?.nombre ?? "Seleccionar grupo"}
                </span>
                {contextoActivo?.rol && (
                  <Badge
                    variant={
                      contextoActivo.rol === "responsable"
                        ? "default"
                        : "secondary"
                    }
                    className="shrink-0 text-xs font-medium"
                  >
                    {contextoActivo.rol === "responsable"
                      ? "Responsable"
                      : "Participante"}
                  </Badge>
                )}
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 min-w-11 gap-2"
                  aria-label="Cuenta"
                />
              }
            >
              <User aria-hidden="true" className="h-4 w-4" />
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
              <DropdownMenuItem onClick={() => router.push("/grupos")}>
                <Users aria-hidden="true" className="mr-2 h-4 w-4" />
                <span>Cambiar grupo</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  seleccionarPersonal();
                  router.push("/mi-reporte");
                }}
              >
                <UserCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                <span>Mi reporte personal</span>
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => router.push("/login")}
              >
                <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main
          id="contenido-principal"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
