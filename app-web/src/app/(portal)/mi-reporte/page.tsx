"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import {
  ControlEstadoVista,
  EstadoErrorVista,
  EstadoVacioVista,
  type EstadoVistaForzado,
} from "@/components/reportes/estados-vista";
import { FiltroPeriodo } from "@/components/reportes/filtro-periodo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fechaEnZona, formatearDia, formatearDuracion } from "@/lib/fecha";
import {
  type FiltroPeriodoValor,
  crearFiltroInicial,
  formatearTasa,
  obtenerGruposPersonales,
  obtenerMiReportePersonal,
} from "@/lib/reportes";
import type { EstadoAsistencia } from "@/types/dominio";

const BADGE_ESTADO: Record<
  EstadoAsistencia,
  { texto: string; variante: "default" | "secondary" | "destructive" }
> = {
  presente: { texto: "Presente", variante: "default" },
  justificada: { texto: "Justificada", variante: "secondary" },
  ausente: { texto: "Ausente sin motivo", variante: "destructive" },
};

export default function MiReportePage() {
  const [grupoFiltro, setGrupoFiltro] = useState("todos");
  const [filtro, setFiltro] = useState<FiltroPeriodoValor>(() =>
    crearFiltroInicial("todo"),
  );
  const [estadoForzado, setEstadoForzado] =
    useState<EstadoVistaForzado>("normal");
  const [avisoExportacion, setAvisoExportacion] = useState<string | null>(null);

  const gruposPersonales = useMemo(() => obtenerGruposPersonales(), []);

  const reporte = useMemo(
    () => obtenerMiReportePersonal(grupoFiltro, filtro),
    [grupoFiltro, filtro],
  );

  function manejarExportacion(formato: "PDF" | "Excel") {
    setAvisoExportacion(
      `La descarga de tu reporte en ${formato} estará disponible al completar la integración de exportación.`,
    );
  }

  const botonesDeshabilitados =
    estadoForzado === "cargando" ||
    estadoForzado === "error" ||
    estadoForzado === "vacio" ||
    reporte.registros.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mi reporte personal
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta tus asistencias, horas registradas y motivos de ajuste en
            todos tus grupos.
          </p>
        </div>

        <ControlEstadoVista
          estado={estadoForzado}
          alCambiar={setEstadoForzado}
        />
      </div>

      {/* Filtros y exportacion */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={grupoFiltro}
              onValueChange={(val) => setGrupoFiltro(val ?? "todos")}
            >
              <SelectTrigger className="h-8 w-64 bg-background text-xs">
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos mis grupos</SelectItem>
                {gruposPersonales.map(({ grupo, esAnterior }) => (
                  <SelectItem key={grupo.id} value={grupo.id}>
                    {grupo.nombre}
                    {esAnterior ? " (Anterior)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FiltroPeriodo valor={filtro} alCambiar={setFiltro} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={botonesDeshabilitados}
              onClick={() => manejarExportacion("PDF")}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar mi PDF</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={botonesDeshabilitados}
              onClick={() => manejarExportacion("Excel")}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar mi Excel (.xlsx)</span>
            </Button>
          </div>
        </div>

        {avisoExportacion && (
          <p className="text-xs text-primary bg-accent/60 rounded-md px-3 py-1.5">
            {avisoExportacion}
          </p>
        )}
      </div>

      {estadoForzado === "error" ? (
        <EstadoErrorVista
          mensaje="No se pudo cargar tu historial personal. Inténtalo de nuevo."
          alReintentar={() => setEstadoForzado("normal")}
        />
      ) : estadoForzado === "cargando" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : estadoForzado === "vacio" || reporte.registros.length === 0 ? (
        <EstadoVacioVista
          titulo="Sin asistencias en este período"
          descripcion="Aún no tienes registros personales en el grupo y rango seleccionados."
        />
      ) : (
        <>
          {/* Tarjetas KPI personales */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Tasa de asistencia personal
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {formatearTasa(reporte.tasa)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculada sobre jornadas activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Desglose de registros
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {reporte.presentes} presentes
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reporte.justificadas} justificadas ·{" "}
                  {reporte.ausentesSinMotivo} sin motivo
                </p>
              </CardContent>
            </Card>

            {reporte.mostrarHoras && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      Duración registrada
                    </p>
                    <p className="text-2xl font-semibold tabular-nums mt-1">
                      {formatearDuracion(reporte.duracionRegistrada)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tiempo total marcado en jornadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      Tiempo reconocido
                    </p>
                    <p className="text-2xl font-semibold tabular-nums mt-1">
                      {formatearDuracion(reporte.tiempoReconocido)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pendiente:{" "}
                      {formatearDuracion(reporte.tiempoPendiente)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Tabla de registros propios */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Jornada</TableHead>
                    <TableHead>Estado</TableHead>
                    {reporte.mostrarHoras && <TableHead>Horas</TableHead>}
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporte.registros.map(
                    ({ asistencia, jornada, grupo, esGrupoAnterior }) => {
                      const badge = BADGE_ESTADO[asistencia.estado];
                      const huboRecorte =
                        asistencia.duracion_minutos !== null &&
                        asistencia.minutos_reconocidos !== null &&
                        asistencia.minutos_reconocidos <
                          asistencia.duracion_minutos;

                      return (
                        <TableRow
                          key={asistencia.id}
                          className={
                            jornada.cancelada ? "opacity-70 bg-muted/20" : undefined
                          }
                        >
                          <TableCell className="whitespace-nowrap text-xs">
                            {formatearDia(fechaEnZona(jornada.inicio_en))}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm">
                                {grupo.nombre}
                              </span>
                              {esGrupoAnterior && (
                                <Badge
                                  variant="outline"
                                  className="text-[11px]"
                                >
                                  Anterior
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span>{jornada.titulo}</span>
                              {jornada.cancelada && (
                                <Badge
                                  variant="destructive"
                                  className="text-[11px]"
                                >
                                  Cancelada · excluida de totales
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badge.variante}>
                              {badge.texto}
                            </Badge>
                          </TableCell>
                          {reporte.mostrarHoras && (
                            <TableCell className="text-xs whitespace-nowrap">
                              {asistencia.duracion_minutos !== null ? (
                                <div className="space-y-0.5">
                                  <div>
                                    Reconocido:{" "}
                                    <strong>
                                      {formatearDuracion(
                                        asistencia.minutos_reconocidos,
                                      )}
                                    </strong>
                                  </div>
                                  <div className="text-muted-foreground">
                                    Registrado:{" "}
                                    {formatearDuracion(
                                      asistencia.duracion_minutos,
                                    )}
                                  </div>
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-xs max-w-xs">
                            {asistencia.motivo_ausencia ? (
                              <span>{asistencia.motivo_ausencia}</span>
                            ) : asistencia.motivo_ajuste ? (
                              <span
                                className={
                                  huboRecorte
                                    ? "inline-block rounded-full bg-forma-peach px-2 py-1 text-forma-peach-ink font-medium"
                                    : undefined
                                }
                              >
                                {asistencia.motivo_ajuste}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
