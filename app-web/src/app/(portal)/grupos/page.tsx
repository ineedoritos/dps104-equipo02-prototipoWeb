"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, UserCheck, Users } from "lucide-react";

import {
  CONTEXTOS_BASE,
  rutaPortal,
  useContextoPortal,
} from "@/components/layout/contexto-portal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GruposPage() {
  const { contextoActivo } =
    useContextoPortal();
  const [busqueda, setBusqueda] = useState("");

  const gruposFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return CONTEXTOS_BASE;
    return CONTEXTOS_BASE.filter(
      (grupo) =>
        grupo.nombre.toLowerCase().includes(termino) ||
        grupo.descripcion.toLowerCase().includes(termino),
    );
  }, [busqueda]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-forma-ink">
            Seleccionar grupo
          </h1>
          <p className="text-sm text-muted-foreground">
            Elige el grupo que deseas consultar o abre tu reporte personal.
          </p>
        </div>

        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={rutaPortal("/mi-reporte", contextoActivo?.id)} />}
          className="gap-2 self-start sm:self-auto"
        >
          <UserCheck className="h-4 w-4" />
          <span>Mi reporte personal</span>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar grupo por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9 bg-card"
          aria-label="Buscar grupo"
        />
      </div>

      {gruposFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">
              No se encontraron grupos con ese criterio
            </p>
            <p className="text-xs text-muted-foreground">
              Prueba con otro nombre.
            </p>
            <Button variant="ghost" onClick={() => setBusqueda("")}>Limpiar búsqueda</Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid max-w-4xl gap-2 rounded-[28px] bg-forma-paper p-2">
          {gruposFiltrados.map((grupo) => {
            const responsable = grupo.rol === "responsable";
            const actual = contextoActivo?.id === grupo.id;
            const href = responsable
              ? rutaPortal("/dashboard", grupo.id)
              : rutaPortal("/mi-reporte", grupo.id, { alcance: grupo.id });

            return (
              <li key={grupo.id}>
                <Link href={href} className="flex min-h-16 items-center gap-3 rounded-[20px] p-2.5 hover:bg-forma-canvas focus-visible:outline-2 focus-visible:outline-ring">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-full ${responsable ? "bg-forma-blue text-forma-blue-ink" : "bg-forma-lilac text-forma-lilac-ink"}`}>
                    <Users aria-hidden="true" size={21} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-semibold tracking-tight text-forma-ink">{grupo.nombre}</h2>
                    <p className="text-sm leading-snug text-forma-muted">{grupo.descripcion}</p>
                    <p className="mt-1 text-xs font-medium text-forma-muted">
                      {responsable ? "Responsable" : "Participante"}{actual ? " · Grupo actual" : ""}
                    </p>
                  </div>
                  <ArrowRight aria-hidden="true" size={19} strokeWidth={1.8} className="shrink-0 text-forma-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
