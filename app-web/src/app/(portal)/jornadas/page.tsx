import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JornadasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jornadas</h1>
        <p className="text-sm text-muted-foreground">
          Consulta de solo lectura de jornadas programadas, finalizadas o
          canceladas del grupo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado de jornadas</CardTitle>
          <CardDescription>
            Aquí podrás revisar cada jornada y el detalle de asistencias y horas
            registradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          La creación y registro operativo de jornadas se realiza desde la
          aplicación móvil.
        </CardContent>
      </Card>
    </div>
  );
}
