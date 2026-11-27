"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList } from "lucide-react";

import { GraficosDashboard } from "@/components/charts/graficos-dashboard";
import { rutaPortal, useContextoPortal } from "@/components/layout/contexto-portal";
import {
  ControlEstadoVista,
  EstadoErrorVista,
  EstadoVacioVista,
  type EstadoVistaForzado,
} from "@/components/reportes/estados-vista";
import { FiltroPeriodo } from "@/components/reportes/filtro-periodo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatearDuracion } from "@/lib/fecha";
import {
  type FiltroPeriodoValor,
  crearFiltroInicial,
  formatearTasa,
  obtenerResumenDashboard,
} from "@/lib/reportes";

export default function DashboardPage() {
  const { contextoActivo } = useContextoPortal();
  const [filtro, setFiltro] = useState<FiltroPeriodoValor>(() =>
    crearFiltroInicial("mes"),
  );
  const [estadoForzado, setEstadoForzado] =
    useState<EstadoVistaForzado>("normal");

  const esResponsable =
    contextoActivo?.tipo === "grupo" && contextoActivo.rol === "responsable";

  const resumen = useMemo(() => {
    if (!contextoActivo || contextoActivo.tipo !== "grupo") return null;
    return obtenerResumenDashboard(contextoActivo.id, filtro);
  }, [contextoActivo, filtro]);

  if (!esResponsable) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-forma-ink">
            Resumen del grupo
          </h1>
          <p className="text-sm text-muted-foreground">
            El panel de estadísticas está disponible para los responsables del
            grupo.
          </p>
        </div>
        <EstadoVacioVista
          titulo="Selecciona un grupo donde seas responsable"
          descripcion="Puedes elegir otro grupo desde el selector o consultar tu historial personal en Mi reporte."
          accion={
            <div className="flex flex-wrap justify-center gap-2">
              <Button nativeButton={false} render={<Link href={rutaPortal("/grupos", contextoActivo?.id)} />} size="sm">
                Ir a Grupos
              </Button>
              <Button
                nativeButton={false}
                render={<Link href={rutaPortal("/mi-reporte", contextoActivo?.id)} />}
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

  const sinRegistros =
    estadoForzado === "vacio" ||
    !resumen ||
    resumen.totalPresentes + resumen.totalAusencias === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-forma-ink">
            Resumen
          </h1>
          <p className="text-sm text-muted-foreground">
            Asistencia, jornadas y horas del período seleccionado.
          </p>
        </div>

      </div>

      {/* Barra de filtros de periodo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-forma-paper p-4 sm:p-5">
        <FiltroPeriodo valor={filtro} alCambiar={setFiltro} />


      </div>

      {estadoForzado === "error" ? (
        <EstadoErrorVista
          mensaje="No se pudieron cargar las estadísticas del grupo. Inténtalo nuevamente."
          alReintentar={() => setEstadoForzado("normal")}
        />
      ) : estadoForzado === "cargando" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[320px] w-full rounded-xl" />
            <Skeleton className="h-[320px] w-full rounded-xl" />
          </div>
        </div>
      ) : sinRegistros ? (
        <EstadoVacioVista
          titulo="Sin registros en este período"
          descripcion="No hay asistencias contabilizadas en las fechas seleccionadas. Cambia el rango o selecciona Todo para ver el histórico."
        />
      ) : (
        <>
          {/* Grid de tarjetas KPI */}
          <div
            className={
              resumen.mostrarHoras
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                : "grid gap-4 sm:grid-cols-3"
            }
          >
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Tasa de asistencia
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {formatearTasa(resumen.tasaAsistencia)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sobre {resumen.totalPresentes + resumen.totalAusencias}{" "}
                  registros válidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Presentes vs Ausencias
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {resumen.totalPresentes} / {resumen.totalAusencias}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumen.totalAusentesSinMotivo} sin motivo ·{" "}
                  {resumen.totalJustificadas} justificadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Jornadas contabilizadas
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {resumen.jornadasContabilizadas}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumen.jornadasCanceladas === 0
                    ? "Sin jornadas canceladas"
                    : `${resumen.jornadasCanceladas} cancelada(s) excluida(s)`}
                </p>
              </CardContent>
            </Card>

            {resumen.mostrarHoras && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    Horas reconocidas / registradas
                  </p>
                  <p className="text-2xl font-semibold tabular-nums mt-1">
                    {formatearDuracion(resumen.minutosReconocidos)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    De {formatearDuracion(resumen.minutosRegistrados)}{" "}
                    registradas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <GraficosDashboard
            presentes={resumen.totalPresentes}
            justificadas={resumen.totalJustificadas}
            ausentesSinMotivo={resumen.totalAusentesSinMotivo}
            tendencia={resumen.tendenciaPorJornada}
          />
        </>
      )}
      <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href={rutaPortal("/reportes", contextoActivo?.id)} />}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Ver reporte detallado</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={rutaPortal("/jornadas", contextoActivo?.id)} />}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Explorar jornadas</span>
          </Button>
        </div>
      <ControlEstadoVista estado={estadoForzado} alCambiar={setEstadoForzado} />
    </div>
  );
}
