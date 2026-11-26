"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, QrCode, UserCheck } from "lucide-react";

import { useContextoPortal } from "@/components/layout/contexto-portal";
import {
  ControlEstadoVista,
  EstadoErrorVista,
  EstadoVacioVista,
  type EstadoVistaForzado,
} from "@/components/reportes/estados-vista";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fechaEnZona,
  formatearDia,
  formatearDuracion,
  formatearFecha,
} from "@/lib/fecha";
import { obtenerJornadasGrupo } from "@/lib/reportes";
import type { EstadoJornadaDerivado } from "@/types/dominio";

type FiltroEstadoJornada = "todas" | EstadoJornadaDerivado;

const ETIQUETA_ESTADO: Record<
  EstadoJornadaDerivado,
  { texto: string; variante: "default" | "secondary" | "outline" | "destructive" }
> = {
  programada: { texto: "Programada", variante: "outline" },
  en_curso: { texto: "En curso", variante: "default" },
  finalizada: { texto: "Finalizada", variante: "secondary" },
  cancelada: { texto: "Cancelada · excluida de totales", variante: "destructive" },
};

export default function JornadasPage() {
  const { contextoActivo } = useContextoPortal();
  const [desdeDia, setDesdeDia] = useState("");
  const [hastaDia, setHastaDia] = useState("");
  const [estadoFiltro, setEstadoFiltro] =
    useState<FiltroEstadoJornada>("todas");
  const [estadoForzado, setEstadoForzado] =
    useState<EstadoVistaForzado>("normal");

  const esResponsable =
    contextoActivo?.tipo === "grupo" && contextoActivo.rol === "responsable";

  const jornadasBase = useMemo(() => {
    if (!contextoActivo || contextoActivo.tipo !== "grupo") return [];
    return obtenerJornadasGrupo(contextoActivo.id);
  }, [contextoActivo]);

  const jornadasFiltradas = useMemo(() => {
    return jornadasBase.filter((item) => {
      if (estadoFiltro !== "todas" && item.estadoDerivado !== estadoFiltro) {
        return false;
      }
      const dia = fechaEnZona(item.jornada.inicio_en);
      if (desdeDia && dia < desdeDia) return false;
      if (hastaDia && dia > hastaDia) return false;
      return true;
    });
  }, [jornadasBase, estadoFiltro, desdeDia, hastaDia]);

  if (!esResponsable) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jornadas</h1>
          <p className="text-sm text-muted-foreground">
            Esta vista está disponible para los responsables del grupo.
          </p>
        </div>
        <EstadoVacioVista
          titulo="Selecciona un grupo donde seas responsable"
          descripcion="Cambia de grupo para explorar el historial de jornadas o consulta tus registros en Mi reporte."
          accion={
            <Button nativeButton={false} render={<Link href="/grupos" />} size="sm">
              Ir a Grupos
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Jornadas del grupo
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta en modo solo lectura el historial de jornadas, asistencia y
            horas de {contextoActivo?.nombre}.
          </p>
        </div>

        <ControlEstadoVista
          estado={estadoForzado}
          alCambiar={setEstadoForzado}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <label className="flex items-center gap-1.5">
            <span>Desde</span>
            <Input
              type="date"
              value={desdeDia}
              onChange={(e) => setDesdeDia(e.target.value)}
              className="h-8 w-auto bg-background text-xs"
              aria-label="Filtrar desde fecha"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span>Hasta</span>
            <Input
              type="date"
              value={hastaDia}
              onChange={(e) => setHastaDia(e.target.value)}
              className="h-8 w-auto bg-background text-xs"
              aria-label="Filtrar hasta fecha"
            />
          </label>
        </div>

        <Select
          value={estadoFiltro}
          onValueChange={(val) =>
            setEstadoFiltro((val as FiltroEstadoJornada) ?? "todas")
          }
        >
          <SelectTrigger className="h-8 w-44 bg-background text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las jornadas</SelectItem>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="en_curso">En curso</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        {(desdeDia || hastaDia || estadoFiltro !== "todas") && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setDesdeDia("");
              setHastaDia("");
              setEstadoFiltro("todas");
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {estadoForzado === "error" ? (
        <EstadoErrorVista
          mensaje="No se pudo cargar el listado de jornadas. Inténtalo de nuevo."
          alReintentar={() => setEstadoForzado("normal")}
        />
      ) : estadoForzado === "cargando" ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : estadoForzado === "vacio" || jornadasFiltradas.length === 0 ? (
        <EstadoVacioVista
          titulo="Sin jornadas para mostrar"
          descripcion="No hay jornadas que coincidan con los filtros seleccionados."
        />
      ) : (
        <div className="space-y-3">
          {jornadasFiltradas.map((item) => {
            const { jornada, estadoDerivado } = item;
            const infoEstado = ETIQUETA_ESTADO[estadoDerivado];
            const dia = fechaEnZona(jornada.inicio_en);
            const horaInicio = formatearFecha(jornada.inicio_en, {
              hour: "2-digit",
              minute: "2-digit",
            });
            const horaFin = formatearFecha(jornada.fin_en, {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={jornada.id}
                className="transition-colors hover:border-primary/50"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold truncate">
                        {jornada.titulo}
                      </h2>
                      <Badge variant={infoEstado.variante}>
                        {infoEstado.texto}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {jornada.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      <span>
                        {formatearDia(dia)} · {horaInicio} – {horaFin}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {jornada.modalidad_asistencia === "qr" ? (
                          <QrCode className="h-3.5 w-3.5" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5" />
                        )}
                        {jornada.modalidad_asistencia === "qr" ? "QR" : "Manual"}
                      </span>
                      {jornada.control_horas && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Control de horas
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right text-xs">
                      <p className="font-medium text-foreground">
                        {item.totalRegistros} registros
                      </p>
                      <p className="text-muted-foreground">
                        {item.presentes} presentes ·{" "}
                        {item.ausentes + item.justificadas} ausencias
                        {jornada.control_horas &&
                          item.minutosReconocidos > 0 &&
                          ` · ${formatearDuracion(item.minutosReconocidos)}`}
                      </p>
                    </div>

                    <Button
                      nativeButton={false}
                      render={<Link href={`/jornadas/${jornada.id}`} />}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <span>Ver detalle</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
