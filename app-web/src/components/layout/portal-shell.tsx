"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  User,
} from "lucide-react";

import { rutaPortal, useContextoPortal } from "@/components/layout/contexto-portal";
import { ListaNavegacion } from "@/components/layout/lista-navegacion";
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
import { cn } from "@/lib/utils";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const enGrupos = usePathname() === "/grupos";
  const { contextoActivo } = useContextoPortal();
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="flex min-h-dvh bg-forma-canvas text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:outline-2 focus:outline-ring"
        href="#contenido-principal"
      >
        Saltar al contenido
      </a>
      <aside
        className={cn(
          "hidden shrink-0 flex-col bg-forma-paper md:flex",
          colapsado ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex min-h-16 items-center gap-2 px-3",
            colapsado ? "justify-center" : "justify-between",
          )}
        >
          {!colapsado && (
            <Link
              href={rutaPortal("/grupos", contextoActivo?.id)}
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
          <ListaNavegacion colapsado={colapsado} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="mx-4 mt-3 grid min-h-16 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 rounded-[28px] bg-forma-paper px-2.5 py-2 sm:mx-6 md:mt-5 md:grid-cols-[minmax(0,1fr)_auto] md:px-5">
          <Link
            href={rutaPortal("/grupos", contextoActivo?.id)}
            aria-label={contextoActivo ? "Cambiar grupo" : "Elegir grupo"}
            className="grid size-11 place-items-center rounded-full bg-forma-fill text-forma-ink hover:bg-forma-canvas focus-visible:outline-2 focus-visible:outline-ring md:hidden"
          >
            <Users aria-hidden="true" size={21} strokeWidth={1.8} />
          </Link>
          <div className="flex min-w-0 flex-col items-center gap-0.5 text-center md:flex-row md:gap-4 md:text-left">
            <div className="min-w-0">
              <p className="break-words font-semibold leading-tight tracking-tight text-forma-ink">
                {contextoActivo?.nombre ?? "Registro de actividades"}
              </p>
              {contextoActivo && (
                <p className="text-xs text-forma-muted">
                  {contextoActivo.rol === "responsable" ? "Responsable" : "Participante"}
                </p>
              )}
            </div>
            {!enGrupos && (
              <Link
                href={rutaPortal("/grupos", contextoActivo?.id)}
                className="hidden min-h-11 shrink-0 items-center rounded-full bg-forma-fill px-4 text-sm font-semibold text-forma-ink hover:bg-forma-canvas focus-visible:outline-2 focus-visible:outline-ring md:inline-flex"
              >
                {contextoActivo ? "Cambiar grupo" : "Elegir grupo"}
              </Link>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-11"
                  aria-label="Cuenta"
                />
              }
            >
              <User aria-hidden="true" className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-forma-paper shadow-none">
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
          className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6 md:pb-10"
        >
          {children}
        </main>
        <div className="fixed inset-x-0 bottom-0 z-30 bg-forma-canvas px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <div className="mx-auto max-w-md">
            <ListaNavegacion inferior />
          </div>
        </div>
      </div>
    </div>
  );
}
