"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

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
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const correoLimpio = correo.trim();
    if (!correoLimpio || !contrasena.trim()) {
      setError("Ingresa tu correo electrónico y contraseña para continuar.");
      return;
    }
    if (!correoLimpio.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setError(null);
    setCargando(true);

    setTimeout(() => {
      if (correoLimpio.toLowerCase() === "error@correo.com") {
        setCargando(false);
        setError(
          "Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.",
        );
        return;
      }
      router.push("/grupos");
    }, 450);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Registro de actividades · Portal de Reportes
          </p>
          <CardTitle className="text-xl font-semibold">
            Iniciar sesión
          </CardTitle>
          <CardDescription>
            Consulta estadísticas, reportes de participación y tu historial
            personal de asistencias.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={manejarSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="correo" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="correo"
                type="email"
                placeholder="nombre@correo.com"
                autoComplete="email"
                disabled={cargando}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contrasena" className="text-sm font-medium">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  disabled={cargando}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMostrarContrasena((prev) => !prev)}
                  className="absolute inset-y-0 right-1 my-auto text-muted-foreground"
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  disabled={cargando}
                >
                  {mostrarContrasena ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={cargando}>
              {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{cargando ? "Verificando acceso..." : "Iniciar sesión"}</span>
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center pt-1">
            Usa la misma cuenta con la que ingresas en la aplicación móvil.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
