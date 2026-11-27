"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obtenerRangoPeriodo, type PeriodoPredefinido } from "@/lib/fecha";
import type { FiltroPeriodoValor } from "@/lib/reportes";

interface FiltroPeriodoProps {
  valor: FiltroPeriodoValor;
  alCambiar: (nuevo: FiltroPeriodoValor) => void;
}

const PRESETS: Array<{ id: PeriodoPredefinido; etiqueta: string }> = [
  { id: "7d", etiqueta: "7 días" },
  { id: "mes", etiqueta: "Este mes" },
  { id: "todo", etiqueta: "Todo" },
];

export function FiltroPeriodo({ valor, alCambiar }: FiltroPeriodoProps) {
  const [borrador, setBorrador] = useState<FiltroPeriodoValor | null>(null);
  const fechas = borrador ?? valor;

  function cambiarFecha(campo: "desdeDia" | "hastaDia", fecha: string) {
    const siguiente: FiltroPeriodoValor = { ...fechas, tipo: "personalizado", [campo]: fecha };
    if (siguiente.desdeDia && siguiente.hastaDia && siguiente.desdeDia > siguiente.hastaDia) {
      setBorrador(siguiente);
      return;
    }
    setBorrador(null);
    alCambiar(siguiente);
  }

  function aplicarPreset(preset: PeriodoPredefinido) {
    setBorrador(null);
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
        <div role="group" aria-label="Período" className="grid grid-cols-3 items-center gap-1 rounded-full bg-forma-fill p-1">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              aria-pressed={!borrador && valor.tipo === preset.id}
              variant={!borrador && valor.tipo === preset.id ? "secondary" : "ghost"}
              className={!borrador && valor.tipo === preset.id ? "min-w-0 bg-forma-paper px-2 font-semibold" : "min-w-0 px-2"}
              onClick={() => aplicarPreset(preset.id)}
            >
              {preset.etiqueta}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-forma-muted min-[360px]:grid-cols-2">
          <label className="grid min-w-0 gap-1">
            <span>Desde</span>
            <Input
              type="date"
              value={fechas.desdeDia}
              onChange={(event) => cambiarFecha("desdeDia", event.target.value)}
              aria-invalid={Boolean(borrador)}
              className="bg-forma-paper"
            />
          </label>
          <label className="grid min-w-0 gap-1">
            <span>Hasta</span>
            <Input
              type="date"
              value={fechas.hastaDia}
              onChange={(event) => cambiarFecha("hastaDia", event.target.value)}
              aria-invalid={Boolean(borrador)}
              className="bg-forma-paper"
            />
          </label>
        </div>
      </div>

      {borrador && (
        <p className="text-xs text-destructive" role="alert">
          La fecha inicial no puede ser mayor que la fecha final.
        </p>
      )}
    </div>
  );
}
