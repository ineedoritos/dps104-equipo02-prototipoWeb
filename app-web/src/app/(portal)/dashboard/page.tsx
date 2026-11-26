import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen del grupo</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores generales de asistencia, horas reconocidas y tendencia por
          período.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vista preparada</CardTitle>
          <CardDescription>
            Aquí se mostrarán los indicadores principales y gráficas de
            participación del grupo seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Selecciona un período o navega entre las secciones desde la barra
          lateral.
        </CardContent>
      </Card>
    </div>
  );
}
