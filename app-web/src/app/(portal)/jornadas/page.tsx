"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiltroPeriodo } from "@/components/reportes/filtro-periodo";
import { ArrowRight, Clock, QrCode, UserCheck } from "lucide-react";

import { rutaPortal, useContextoPortal } from "@/components/layout/contexto-portal";
import {
  ControlEstadoVista,
  EstadoErrorVista,
  EstadoVacioVista,
  type EstadoVistaForzado,
} from "@/components/reportes/estados-vista";
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
  fechaEnZona,
  formatearDia,
  formatearDuracion,
  formatearFecha,
} from "@/lib/fecha";
import { obtenerJornadasGrupo } from "@/lib/reportes";
import type { EstadoJornadaDerivado } from "@/types/dominio";

type FiltroEstadoJornada = "todas" | EstadoJornadaDerivado;

const TONO_JORNADA = {
  programada: "bg-forma-blue text-forma-blue-ink",
  en_curso: "bg-forma-mint text-forma-mint-ink",
  finalizada: "bg-forma-fill text-forma-muted",
  cancelada: "bg-forma-rose text-forma-rose-ink",
};

const ETIQUETA_ESTADO: Record<EstadoJornadaDerivado, string> = {
  programada: "Programada",
  en_curso: "En curso",
  finalizada: "Finalizada",
  cancelada: "Cancelada · excluida de totales",
};

export default function JornadasPage() {
  const { contextoActivo } = useContextoPortal();
  const parametros = useSearchParams();
  const desde = parametros.get("desde") ?? "";
  const hasta = parametros.get("hasta") ?? "";
  const rangoValido = !desde || !hasta || desde <= hasta;
  const desdeDia = rangoValido && /^\d{4}-\d{2}-\d{2}$/.test(desde) ? desde : "";
  const hastaDia = rangoValido && /^\d{4}-\d{2}-\d{2}$/.test(hasta) ? hasta : "";
  const estado = parametros.get("estado");
  const estadoFiltro: FiltroEstadoJornada = estado && Object.hasOwn(ETIQUETA_ESTADO, estado)
    ? estado as EstadoJornadaDerivado
    : "todas";
  const filtros: Record<string, string> = {};
  if (desdeDia) filtros.desde = desdeDia;
  if (hastaDia) filtros.hasta = hastaDia;
  if (estadoFiltro !== "todas") filtros.estado = estadoFiltro;
  const periodo = parametros.get("periodo");
  if (periodo) filtros.periodo = periodo;

  function aplicarFiltros(siguientes: Record<string, string>) {
    window.history.replaceState(null, "", rutaPortal("/jornadas", contextoActivo?.id, siguientes));
  }

  const [reinicioFiltro, setReinicioFiltro] = useState(0);
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
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-forma-ink">Jornadas</h1>
          <p className="text-sm text-muted-foreground">
            Esta vista está disponible para los responsables del grupo.
          </p>
        </div>
        <EstadoVacioVista
          titulo="Selecciona un grupo donde seas responsable"
          descripcion="Cambia de grupo para explorar el historial de jornadas o consulta tus registros en Mi reporte."
          accion={
            <Button nativeButton={false} render={<Link href={rutaPortal("/grupos", contextoActivo?.id)} />} size="sm">
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
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-forma-ink">
            Jornadas del grupo
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta en modo solo lectura el historial de jornadas, asistencia y
            horas de {contextoActivo?.nombre}.
          </p>
        </div>

      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-forma-paper p-4 sm:p-5">
        <FiltroPeriodo
          key={reinicioFiltro}
          valor={{
            tipo: periodo === "7d" || periodo === "mes" || periodo === "todo"
              ? periodo
              : desdeDia || hastaDia ? "personalizado" : "todo",
            desdeDia,
            hastaDia,
          }}
          alCambiar={(valor) => aplicarFiltros({
            ...filtros,
            desde: valor.desdeDia,
            hasta: valor.hastaDia,
            periodo: valor.tipo,
          })}
        />
        <Select
          value={estadoFiltro}
          onValueChange={(val) => aplicarFiltros({ ...filtros, estado: val ?? "todas" })}
        >
          <SelectTrigger aria-label="Estado de jornada" className="w-full bg-forma-canvas sm:w-auto">
            <SelectValue>{estadoFiltro === "todas" ? "Todas las jornadas" : ETIQUETA_ESTADO[estadoFiltro]}</SelectValue>
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
              setReinicioFiltro((actual) => actual + 1);
              aplicarFiltros({});
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
                className="py-3"
              >
                <CardContent className="flex flex-wrap items-center gap-3">
                  <div aria-hidden="true" className="grid min-h-14 w-12 shrink-0 place-content-center rounded-2xl bg-forma-lilac text-center text-forma-lilac-ink">
                    <span className="text-[11px] font-semibold uppercase">{formatearFecha(jornada.inicio_en, { month: "short" })}</span>
                    <span className="text-xl font-semibold leading-none tabular-nums">{dia.slice(-2)}</span>
                  </div>
                  <div className="min-w-0 flex-1 basis-[55%] space-y-1.5 sm:basis-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-base font-semibold tracking-tight">
                        {jornada.titulo}
                      </h2>
                      <Badge variant="secondary" className={TONO_JORNADA[estadoDerivado]}>
                        {infoEstado}
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

                  <div className="flex w-full flex-wrap items-center justify-between gap-2 pl-[60px] lg:w-auto lg:justify-end lg:pl-0">
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
                      render={<Link href={rutaPortal(`/jornadas/${jornada.id}`, contextoActivo?.id, filtros)} />}
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
      <ControlEstadoVista estado={estadoForzado} alCambiar={setEstadoForzado} />
    </div>
  );
}
