"use client";

import { createContext, useContext, useState } from "react";

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

interface ContextoPortalValor {
  contextoActivo: ContextoPortal | null;
  seleccionarGrupo: (id: string) => ContextoPortal | null;
  seleccionarPersonal: () => void;
}

const PERSONAL_CONTEXTO: ContextoPortal = {
  id: "personal",
  nombre: "Mi reporte personal",
  descripcion: "Consulta consolidada de tus asistencias e historial.",
  tipo: "personal",
};

const ContextoPortalContext = createContext<ContextoPortalValor | null>(null);

export function ContextoPortalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contextoActivo, setContextoActivo] = useState<ContextoPortal | null>(
    CONTEXTOS_BASE[0],
  );

  function seleccionarGrupo(id: string): ContextoPortal | null {
    const encontrado = CONTEXTOS_BASE.find((item) => item.id === id) ?? null;
    if (encontrado) {
      setContextoActivo(encontrado);
    }
    return encontrado;
  }

  function seleccionarPersonal() {
    setContextoActivo(PERSONAL_CONTEXTO);
  }

  return (
    <ContextoPortalContext.Provider
      value={{ contextoActivo, seleccionarGrupo, seleccionarPersonal }}
    >
      {children}
    </ContextoPortalContext.Provider>
  );
}

export function useContextoPortal(): ContextoPortalValor {
  const contexto = useContext(ContextoPortalContext);
  if (!contexto) {
    throw new Error(
      "useContextoPortal debe usarse dentro de ContextoPortalProvider.",
    );
  }
  return contexto;
}
