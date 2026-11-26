import Link from "next/link";
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
            Ingresa con tu cuenta para consultar estadísticas, reportes y tu
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
            />
          </div>
          <Button className="w-full" render={<Link href="/dashboard" />}>
            Entrar al portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
