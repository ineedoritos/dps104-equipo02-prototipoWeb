"use client";

import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obtenerRangoPeriodo, type PeriodoPredefinido } from "@/lib/fecha";
import type { FiltroPeriodoValor } from "@/lib/reportes";

interface FiltroPeriodoProps {
  valor: FiltroPeriodoValor;
  alCambiar: (nuevo: FiltroPeriodoValor) => void;
}

const PRESETS: Array<{ id: PeriodoPredefinido; etiqueta: string }> = [
  { id: "7d", etiqueta: "Últimos 7 días" },
  { id: "mes", etiqueta: "Este mes" },
  { id: "todo", etiqueta: "Todo" },
];

export function FiltroPeriodo({ valor, alCambiar }: FiltroPeriodoProps) {
  const rangoInvalido =
    valor.tipo === "personalizado" &&
    Boolean(valor.desdeDia) &&
    Boolean(valor.hastaDia) &&
    valor.desdeDia > valor.hastaDia;

  function aplicarPreset(preset: PeriodoPredefinido) {
    const rango = obtenerRangoPeriodo(preset);
    alCambiar({
      tipo: preset,
      desdeDia: rango.desdeDia ?? "",
      hastaDia: rango.hastaDia ?? "",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="xs"
              variant={valor.tipo === preset.id ? "default" : "ghost"}
              onClick={() => aplicarPreset(preset.id)}
            >
              {preset.etiqueta}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 hidden sm:inline" />
          <label className="flex items-center gap-1.5">
            <span>Desde</span>
            <Input
              type="date"
              value={valor.desdeDia}
              onChange={(e) =>
                alCambiar({
                  tipo: "personalizado",
                  desdeDia: e.target.value,
                  hastaDia: valor.hastaDia,
                })
              }
              className="h-8 w-auto bg-card text-xs"
              aria-label="Fecha desde"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span>Hasta</span>
            <Input
              type="date"
              value={valor.hastaDia}
              onChange={(e) =>
                alCambiar({
                  tipo: "personalizado",
                  desdeDia: valor.desdeDia,
                  hastaDia: e.target.value,
                })
              }
              className="h-8 w-auto bg-card text-xs"
              aria-label="Fecha hasta"
            />
          </label>
        </div>
      </div>

      {rangoInvalido && (
        <p className="text-xs text-destructive" role="alert">
          La fecha inicial no puede ser mayor que la fecha final.
        </p>
      )}
    </div>
  );
}
