"use client";

import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type EstadoVistaForzado = "normal" | "cargando" | "vacio" | "error";

interface ControlEstadoVistaProps {
  estado: EstadoVistaForzado;
  alCambiar: (estado: EstadoVistaForzado) => void;
}

const OPCIONES_ESTADO: Array<{ valor: EstadoVistaForzado; etiqueta: string }> = [
  { valor: "normal", etiqueta: "Normal" },
  { valor: "cargando", etiqueta: "Cargando" },
  { valor: "vacio", etiqueta: "Sin datos" },
  { valor: "error", etiqueta: "Error" },
];

export function ControlEstadoVista({
  estado,
  alCambiar,
}: ControlEstadoVistaProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
      <span className="font-medium mr-1">Vista previa de estado:</span>
      {OPCIONES_ESTADO.map((opcion) => (
        <Button
          key={opcion.valor}
          type="button"
          size="xs"
          variant={estado === opcion.valor ? "default" : "ghost"}
          onClick={() => alCambiar(opcion.valor)}
        >
          {opcion.etiqueta}
        </Button>
      ))}
    </div>
  );
}

interface EstadoVacioVistaProps {
  titulo: string;
  descripcion: string;
  accion?: React.ReactNode;
}

export function EstadoVacioVista({
  titulo,
  descripcion,
  accion,
}: EstadoVacioVistaProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-3">
        <Inbox className="h-9 w-9 mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{titulo}</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {descripcion}
          </p>
        </div>
        {accion && <div className="pt-1">{accion}</div>}
      </CardContent>
    </Card>
  );
}

interface EstadoErrorVistaProps {
  titulo?: string;
  mensaje: string;
  alReintentar: () => void;
}

export function EstadoErrorVista({
  titulo = "No se pudo cargar la información",
  mensaje,
  alReintentar,
}: EstadoErrorVistaProps) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="py-10 text-center space-y-3" role="alert">
        <AlertCircle className="h-9 w-9 mx-auto text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{titulo}</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {mensaje}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={alReintentar}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reintentar</span>
        </Button>
      </CardContent>
    </Card>
  );
}
