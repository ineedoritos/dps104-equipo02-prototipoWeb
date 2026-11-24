import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import usuarioJson from '@/data/usuario.json';
import type { Usuario } from '@/types/actividad';

const usuarioDemo = usuarioJson as Usuario;

export interface UsuarioSesion {
  name: string;
  email: string;
}

interface AuthContextValor {
  usuario: UsuarioSesion | null;
  iniciarSesion: (email: string, password: string) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValor | null>(null);

function obtenerNombreDesdeCorreo(correo: string): string {
  const parteLocal = correo.split('@')[0]?.trim();
  if (!parteLocal) {
    return usuarioDemo.name;
  }

  return parteLocal
    .split(/[._-]+/)
    .filter(Boolean)
    .map((fragmento) => fragmento.charAt(0).toUpperCase() + fragmento.slice(1))
    .join(' ');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  const iniciarSesion = (email: string, _password: string) => {
    const correoLimpio = email.trim().toLowerCase();
    const nombre =
      correoLimpio === 'demo@udb.edu.sv'
        ? usuarioDemo.name
        : obtenerNombreDesdeCorreo(correoLimpio);

    setUsuario({
      name: nombre,
      email: correoLimpio,
    });
  };

  const cerrarSesion = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return contexto;
}
