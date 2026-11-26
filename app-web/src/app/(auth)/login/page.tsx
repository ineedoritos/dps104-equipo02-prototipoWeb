"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [error, setError] = useState<string | null>(null);

  function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!correo.trim() || !contrasena.trim()) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }
    setError(null);
    router.push("/dashboard");
  }

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
        <CardContent>
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
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
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
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
