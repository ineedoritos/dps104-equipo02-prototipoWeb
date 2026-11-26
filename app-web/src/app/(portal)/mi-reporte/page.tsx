import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MiReportePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mi reporte personal
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial de participaciones, horas reconocidas y detalle por grupo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen personal</CardTitle>
          <CardDescription>
            Aquí se mostrará tu asistencia acumulada en tus grupos activos y
            anteriores.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Las horas mostradas corresponden al control interno de cada grupo.
        </CardContent>
      </Card>
    </div>
  );
}
