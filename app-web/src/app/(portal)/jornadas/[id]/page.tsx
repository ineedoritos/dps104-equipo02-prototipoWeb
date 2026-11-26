"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, QrCode, UserCheck } from "lucide-react";

import {
  ControlEstadoVista,
  EstadoErrorVista,
  EstadoVacioVista,
  type EstadoVistaForzado,
} from "@/components/reportes/estados-vista";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fechaEnZona,
  formatearDia,
  formatearDuracion,
  formatearFecha,
} from "@/lib/fecha";
import { obtenerDetalleJornada } from "@/lib/reportes";
import type { EstadoAsistencia } from "@/types/dominio";

const BADGE_ASISTENCIA: Record<
  EstadoAsistencia,
  { texto: string; variante: "default" | "secondary" | "destructive" }
> = {
  presente: { texto: "Presente", variante: "default" },
  justificada: { texto: "Justificada", variante: "secondary" },
  ausente: { texto: "Ausente", variante: "destructive" },
};

export default function DetalleJornadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [estadoForzado, setEstadoForzado] =
    useState<EstadoVistaForzado>("normal");

  const detalle = useMemo(() => obtenerDetalleJornada(id), [id]);

  const resumen = useMemo(() => {
    if (!detalle) {
      return {
        presentes: 0,
        ausentes: 0,
        justificadas: 0,
        minutosReconocidos: 0,
      };
    }
    return {
      presentes: detalle.asistencias.filter((a) => a.estado === "presente")
        .length,
      ausentes: detalle.asistencias.filter((a) => a.estado === "ausente")
        .length,
      justificadas: detalle.asistencias.filter(
        (a) => a.estado === "justificada",
      ).length,
      minutosReconocidos: detalle.asistencias.reduce(
        (acc, a) => acc + (a.minutos_reconocidos ?? 0),
        0,
      ),
    };
  }, [detalle]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button
          render={<Link href="/jornadas" />}
          variant="ghost"
          size="sm"
          className="gap-1.5 self-start -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a jornadas</span>
        </Button>

        <ControlEstadoVista
          estado={estadoForzado}
          alCambiar={setEstadoForzado}
        />
      </div>

      {estadoForzado === "error" ? (
        <EstadoErrorVista
          mensaje="No se pudo cargar el detalle de esta jornada."
          alReintentar={() => setEstadoForzado("normal")}
        />
      ) : estadoForzado === "cargando" ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !detalle ? (
        <EstadoErrorVista
          titulo="Jornada no encontrada"
          mensaje="La jornada solicitada no existe o no pertenece al grupo actual."
          alReintentar={() => setEstadoForzado("normal")}
        />
      ) : (
        <>
          {/* Encabezado de metadatos (solo lectura) */}
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">
                  {detalle.jornada.titulo}
                </CardTitle>
                {detalle.jornada.cancelada ? (
                  <Badge variant="destructive">
                    Cancelada · excluida de totales
                  </Badge>
                ) : (
                  <Badge variant="secondary">Solo lectura</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {detalle.jornada.descripcion}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground pt-1">
                <span>
                  {formatearDia(fechaEnZona(detalle.jornada.inicio_en))} ·{" "}
                  {formatearFecha(detalle.jornada.inicio_en, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {formatearFecha(detalle.jornada.fin_en, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  {detalle.jornada.modalidad_asistencia === "qr" ? (
                    <QrCode className="h-3.5 w-3.5" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                  Modalidad:{" "}
                  {detalle.jornada.modalidad_asistencia === "qr"
                    ? "QR"
                    : "Manual"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {detalle.jornada.control_horas
                    ? "Con control de horas"
                    : "Sin control de horas"}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Resumen rapido */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Presentes</p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {resumen.presentes}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Ausentes sin motivo
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {resumen.ausentes}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Justificadas</p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {resumen.justificadas}
                </p>
              </CardContent>
            </Card>
            {detalle.jornada.control_horas && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    Horas reconocidas
                  </p>
                  <p className="text-2xl font-semibold tabular-nums mt-1">
                    {formatearDuracion(resumen.minutosReconocidos)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabla de asistencias en solo lectura */}
          {estadoForzado === "vacio" || detalle.asistencias.length === 0 ? (
            <EstadoVacioVista
              titulo="Sin asistencias registradas"
              descripcion="Aún no hay registros de participación asociados a esta jornada."
            />
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Origen</TableHead>
                      {detalle.jornada.control_horas && (
                        <>
                          <TableHead>Entrada</TableHead>
                          <TableHead>Salida</TableHead>
                          <TableHead className="text-right">Duración</TableHead>
                          <TableHead className="text-right">
                            Reconocido
                          </TableHead>
                        </>
                      )}
                      <TableHead>Motivos y observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalle.asistencias.map((reg) => {
                      const badge = BADGE_ASISTENCIA[reg.estado];
                      const motivo =
                        reg.motivo_ausencia ?? reg.motivo_ajuste ?? "—";
                      return (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">
                            {reg.participante_nombre}
                          </TableCell>
                          <TableCell>
                            <Badge variant={badge.variante}>
                              {badge.texto}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs uppercase text-muted-foreground">
                            {reg.origen === "qr" ? "QR" : "Manual"}
                          </TableCell>
                          {detalle.jornada.control_horas && (
                            <>
                              <TableCell className="tabular-nums text-xs">
                                {reg.hora_entrada
                                  ? formatearFecha(reg.hora_entrada, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </TableCell>
                              <TableCell className="tabular-nums text-xs">
                                {reg.hora_salida
                                  ? formatearFecha(reg.hora_salida, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatearDuracion(reg.duracion_minutos)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium">
                                {formatearDuracion(reg.minutos_reconocidos)}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-xs text-muted-foreground max-w-xs">
                            {motivo}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
