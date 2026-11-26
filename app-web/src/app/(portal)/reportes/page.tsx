import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reportes de participación
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta detallada por integrante, tasas de asistencia y exportación de
          archivos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tabla de participación</CardTitle>
          <CardDescription>
            Espacio reservado para el listado de integrantes, filtros por período
            y descarga en PDF o Excel.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Las cifras se calculan con zona horaria de El Salvador (UTC-6).
        </CardContent>
      </Card>
    </div>
  );
}
