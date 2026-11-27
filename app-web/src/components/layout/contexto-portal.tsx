"use client";

import { createContext, useContext } from "react";

import { useSearchParams } from "next/navigation";

export type RolGrupo = "responsable" | "participante";

export interface ContextoPortal {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "grupo" | "personal";
  rol?: RolGrupo;
}

export const CONTEXTOS_BASE: ContextoPortal[] = [
  {
    id: "grupo-voluntariado",
    nombre: "Brigada Universitaria UDB",
    descripcion: "Voluntariado y apoyo comunitario en campus.",
    tipo: "grupo",
    rol: "responsable",
  },
  {
    id: "grupo-deporte",
    nombre: "Club de Atletismo Campus",
    descripcion: "Entrenamientos y jornadas deportivas semanales.",
    tipo: "grupo",
    rol: "participante",
  },
  {
    id: "grupo-laboratorio",
    nombre: "Taller de Robótica Aplicada",
    descripcion: "Prácticas de laboratorio y mentorías técnicas.",
    tipo: "grupo",
    rol: "responsable",
  },
];

export function rutaPortal(
  ruta: string,
  grupoId?: string,
  filtros?: Record<string, string>,
): string {
  const parametros = new URLSearchParams(filtros);
  if (grupoId) parametros.set("grupo", grupoId);
  const consulta = parametros.toString();
  return consulta ? `${ruta}?${consulta}` : ruta;
}

const ContextoPortalContext = createContext<ContextoPortal | null>(null);

export function ContextoPortalProvider({ children }: { children: React.ReactNode }) {
  const grupoId = useSearchParams().get("grupo");
  const grupo = CONTEXTOS_BASE.find((item) => item.id === grupoId) ?? null;

  return (
    <ContextoPortalContext.Provider value={grupo}>
      {children}
    </ContextoPortalContext.Provider>
  );
}

export function useContextoPortal() {
  return { contextoActivo: useContext(ContextoPortalContext) };
}
