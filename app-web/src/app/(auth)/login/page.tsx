import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Registro de actividades
          </CardTitle>
          <CardDescription>
            Acceso al portal web de estadísticas, reportes de participación e
            historial personal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="correo" className="text-sm font-medium">
              Correo electrónico
            </label>
            <Input
              id="correo"
              type="email"
              placeholder="nombre@correo.com"
              autoComplete="email"
              disabled
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="contrasena" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="contrasena"
              type="password"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              disabled
            />
          </div>
          <Button type="button" className="w-full" disabled>
            Iniciar sesión
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            El inicio de sesión se habilitará al conectar la autenticación del
            portal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
