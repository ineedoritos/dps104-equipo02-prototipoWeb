"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Download, Eye, Search } from "lucide-react";

import { useContextoPortal } from "@/components/layout/contexto-portal";
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
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatearDia, formatearDuracion } from "@/lib/fecha";
import {
  type FiltroPeriodoValor,
  calcularTasaAsistencia,
  crearFiltroInicial,
  formatearTasa,
  obtenerReporteGrupoMock,
} from "@/lib/reportes";
import type { FilaReporteGrupo } from "@/types/dominio";

type ColumnaOrden =
  | "nombre"
  | "presentes"
  | "ausencias"
  | "tasa"
  | "minutos_reconocidos";

export default function ReportesPage() {
  const { contextoActivo } = useContextoPortal();
  const [filtro, setFiltro] = useState<FiltroPeriodoValor>(() =>
    crearFiltroInicial("mes"),
  );
  const [busqueda, setBusqueda] = useState("");
  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>("nombre");
  const [direccionOrden, setDireccionOrden] = useState<"asc" | "desc">("asc");
  const [estadoForzado, setEstadoForzado] =
    useState<EstadoVistaForzado>("normal");
  const [integranteDetalle, setIntegranteDetalle] =
    useState<FilaReporteGrupo | null>(null);
  const [avisoExportacion, setAvisoExportacion] = useState<string | null>(null);

  const esResponsable =
    contextoActivo?.tipo === "grupo" && contextoActivo.rol === "responsable";

  const { filas, mostrarHoras } = useMemo(() => {
    if (!contextoActivo || contextoActivo.tipo !== "grupo") {
      return { filas: [], mostrarHoras: false };
    }
    return obtenerReporteGrupoMock(contextoActivo.id, filtro);
  }, [contextoActivo, filtro]);

  const filasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const base = termino
      ? filas.filter((f) => f.nombre.toLowerCase().includes(termino))
      : filas;

    return [...base].sort((a, b) => {
      let comparacion = 0;
      if (columnaOrden === "nombre") {
        comparacion = a.nombre.localeCompare(b.nombre, "es");
      } else if (columnaOrden === "presentes") {
        comparacion = a.presentes - b.presentes;
      } else if (columnaOrden === "ausencias") {
        comparacion = a.ausencias_total - b.ausencias_total;
      } else if (columnaOrden === "tasa") {
        comparacion = (a.tasa_asistencia ?? -1) - (b.tasa_asistencia ?? -1);
      } else {
        comparacion = a.minutos_reconocidos - b.minutos_reconocidos;
      }
      return direccionOrden === "asc" ? comparacion : -comparacion;
    });
  }, [filas, busqueda, columnaOrden, direccionOrden]);

  const totales = useMemo(() => {
    const presentes = filasFiltradas.reduce((acc, f) => acc + f.presentes, 0);
    const ausentesSinMotivo = filasFiltradas.reduce(
      (acc, f) => acc + f.ausentes_sin_motivo,
      0,
    );
    const justificadas = filasFiltradas.reduce(
      (acc, f) => acc + f.justificadas,
      0,
    );
    const minutosRegistrados = filasFiltradas.reduce(
      (acc, f) => acc + f.minutos_registrados,
      0,
    );
    const minutosReconocidos = filasFiltradas.reduce(
      (acc, f) => acc + f.minutos_reconocidos,
      0,
    );
    return {
      presentes,
      ausentesSinMotivo,
      justificadas,
      tasa: calcularTasaAsistencia(presentes, ausentesSinMotivo, justificadas),
      minutosRegistrados,
      minutosReconocidos,
    };
  }, [filasFiltradas]);

  function alternarOrden(columna: ColumnaOrden) {
    if (columnaOrden === columna) {
      setDireccionOrden((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setColumnaOrden(columna);
    setDireccionOrden(columna === "nombre" ? "asc" : "desc");
  }

  function manejarExportacion(formato: "PDF" | "Excel") {
    setAvisoExportacion(
      `La descarga en ${formato} estará disponible al completar la integración de exportación.`,
    );
  }

  if (!esResponsable) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reporte de participación
          </h1>
          <p className="text-sm text-muted-foreground">
            Esta vista está disponible para los responsables del grupo.
          </p>
        </div>
        <EstadoVacioVista
          titulo="Selecciona un grupo donde seas responsable"
          descripcion="Cambia de grupo para ver el reporte completo o consulta tu historial personal en Mi reporte."
          accion={
            <div className="flex flex-wrap justify-center gap-2">
              <Button nativeButton={false} render={<Link href="/grupos" />} size="sm">
                Ir a Grupos
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/mi-reporte" />}
                variant="outline"
                size="sm"
              >
                Ver mi reporte
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const sinDatosPeriodo = estadoForzado === "vacio" || filas.length === 0;
  const sinCoincidencias =
    !sinDatosPeriodo && filasFiltradas.length === 0 && busqueda.trim() !== "";
  const botonesExportarDeshabilitados =
    estadoForzado === "cargando" ||
    estadoForzado === "error" ||
    filasFiltradas.length === 0 ||
    sinDatosPeriodo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reporte de participación
          </h1>
          <p className="text-sm text-muted-foreground">
            Desglose por integrante de {contextoActivo?.nombre}. Haz clic en una
            fila para revisar motivos de ausencia y ajustes de horas.
          </p>
        </div>

        <ControlEstadoVista
          estado={estadoForzado}
          alCambiar={setEstadoForzado}
        />
      </div>

      {/* Barra superior de herramientas */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <FiltroPeriodo valor={filtro} alCambiar={setFiltro} />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="search"
                placeholder="Buscar integrante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 h-8 bg-background"
                aria-label="Buscar integrante"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={botonesExportarDeshabilitados}
              onClick={() => manejarExportacion("PDF")}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar PDF</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={botonesExportarDeshabilitados}
              onClick={() => manejarExportacion("Excel")}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar Excel (.xlsx)</span>
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
          mensaje="No se pudo obtener el reporte de participación del grupo. Inténtalo nuevamente."
          alReintentar={() => setEstadoForzado("normal")}
        />
      ) : estadoForzado === "cargando" ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : sinDatosPeriodo ? (
        <EstadoVacioVista
          titulo="Sin registros en este período"
          descripcion="No hay asistencias contabilizadas en las fechas seleccionadas. Prueba ampliando el rango de consulta."
        />
      ) : sinCoincidencias ? (
        <EstadoVacioVista
          titulo="Sin coincidencias para la búsqueda"
          descripcion={`No encontramos integrantes que coincidan con "${busqueda.trim()}".`}
          accion={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBusqueda("")}
            >
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => alternarOrden("nombre")}
                      className="gap-1 -ml-2 font-medium"
                    >
                      <span>Integrante</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => alternarOrden("presentes")}
                      className="gap-1 font-medium"
                    >
                      <span>Presentes</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => alternarOrden("ausencias")}
                      className="gap-1 font-medium"
                    >
                      <span>Ausentes sin motivo</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Justificadas</TableHead>
                  <TableHead className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => alternarOrden("tasa")}
                      className="gap-1 font-medium"
                    >
                      <span>Tasa de asistencia</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  {mostrarHoras && (
                    <>
                      <TableHead className="text-right">
                        Horas registradas
                      </TableHead>
                      <TableHead className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => alternarOrden("minutos_reconocidos")}
                          className="gap-1 font-medium"
                        >
                          <span>Horas reconocidas</span>
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filasFiltradas.map((fila) => (
                  <TableRow
                    key={fila.usuario_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setIntegranteDetalle(fila)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{fila.nombre}</span>
                        {!fila.activo_en_grupo && (
                          <Badge variant="outline" className="text-[11px]">
                            Anterior
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fila.presentes}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fila.ausentes_sin_motivo}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fila.justificadas}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatearTasa(fila.tasa_asistencia)}
                    </TableCell>
                    {mostrarHoras && (
                      <>
                        <TableCell className="text-right tabular-nums">
                          {formatearDuracion(fila.minutos_registrados)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatearDuracion(fila.minutos_reconocidos)}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIntegranteDetalle(fila);
                        }}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Motivos</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">
                    Totales del grupo
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {totales.presentes}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {totales.ausentesSinMotivo}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {totales.justificadas}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {formatearTasa(totales.tasa)}
                  </TableCell>
                  {mostrarHoras && (
                    <>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {formatearDuracion(totales.minutosRegistrados)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {formatearDuracion(totales.minutosReconocidos)}
                      </TableCell>
                    </>
                  )}
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Las horas reconocidas son internas del grupo y no sustituyen la
        acreditación oficial de servicio social.
      </p>

      {/* Drawer lateral de motivos y ajustes */}
      <Sheet
        open={integranteDetalle !== null}
        onOpenChange={(abierto) => {
          if (!abierto) setIntegranteDetalle(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {integranteDetalle && (
            <>
              <SheetHeader>
                <SheetTitle>{integranteDetalle.nombre}</SheetTitle>
                <SheetDescription>
                  Detalle de ausencias justificadas y ajustes de horas en el
                  período seleccionado.
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-6 space-y-6">
                <section className="space-y-2.5">
                  <h3 className="text-sm font-semibold">
                    Ausencias justificadas (
                    {integranteDetalle.motivos_justificadas.length})
                  </h3>
                  {integranteDetalle.motivos_justificadas.length === 0 ? (
                    <p className="text-xs text-muted-foreground rounded-lg border border-border p-3">
                      Sin ausencias justificadas registradas en este período.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {integranteDetalle.motivos_justificadas.map(
                        (item, idx) => (
                          <div
                            key={`${item.fecha}-${idx}`}
                            className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {item.jornada_titulo}
                              </span>
                              <span>{formatearDia(item.fecha)}</span>
                            </div>
                            <p className="text-sm">{item.motivo}</p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </section>

                {mostrarHoras && (
                  <section className="space-y-2.5">
                    <h3 className="text-sm font-semibold">
                      Ajustes de horas ({integranteDetalle.ajustes_horas.length})
                    </h3>
                    {integranteDetalle.ajustes_horas.length === 0 ? (
                      <p className="text-xs text-muted-foreground rounded-lg border border-border p-3">
                        No hubo recortes ni ajustes sobre las horas registradas.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {integranteDetalle.ajustes_horas.map((ajuste, idx) => (
                          <div
                            key={`${ajuste.fecha}-${idx}`}
                            className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {ajuste.jornada_titulo}
                              </span>
                              <span>{formatearDia(ajuste.fecha)}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span>
                                Registrado:{" "}
                                <strong>
                                  {formatearDuracion(ajuste.duracion_minutos)}
                                </strong>
                              </span>
                              <span>
                                Reconocido:{" "}
                                <strong>
                                  {formatearDuracion(
                                    ajuste.minutos_reconocidos,
                                  )}
                                </strong>
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ajuste.motivo_ajuste}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
