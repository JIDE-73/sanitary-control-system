"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser, PermissionAction } from "@/lib/types";

const STORAGE_KEY = "sics-auth-user";
const TOKEN_KEY = "sics-auth-token";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUserFromLoginResponse: (response: any) => void;
  logout: () => void;
  hasPermission: (module: string, action: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUserFromResponse(response: any): AuthUser | null {
  const raw = response?.findUser ?? response?.user ?? null;
  if (!raw) return null;

  const activo = Boolean(raw.activo ?? response?.activo ?? false);
  if (!activo) return null;

  return {
    id: String(raw.id),
    nombre_usuario: String(raw.nombre_usuario ?? ""),
    activo,
    rol: {
      id: String(raw.rol?.id ?? ""),
      nombre: String(raw.rol?.nombre ?? ""),
      permisos: raw.rol?.permisos ?? { modulos: {}, sistema: {} },
    },
    persona: {
      Medico: raw.persona?.Medico ?? null,
      nombre: raw.persona?.nombre ?? "",
      apellido_materno: raw.persona?.apellido_materno ?? "",
      apellido_paterno: raw.persona?.apellido_paterno ?? "",
      direccion: raw.persona?.direccion ?? "",
      email: raw.persona?.email ?? "",
    },
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && parsed.activo) {
        setUser(parsed);
      }
    } catch (error) {
      console.warn("No se pudo leer la sesión guardada", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUserFromLoginResponse = useCallback((response: any) => {
    const normalized = normalizeUserFromResponse(response);
    if (!normalized) {
      setUser(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    setUser(normalized);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        // Guardar el token si viene en la respuesta
        if (response?.token) {
          window.localStorage.setItem(TOKEN_KEY, response.token);
        }
      } catch (error) {
        console.warn("No se pudo guardar la sesión", error);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const hasPermission = useCallback(
    (module: string, action: PermissionAction) => {
      if (!user?.rol?.permisos) return false;
      const modPerms = user.rol.permisos.modulos?.[module];
      if (!Array.isArray(modPerms)) return false;
      return modPerms.includes(action);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && user.activo),
      setUserFromLoginResponse,
      logout,
      hasPermission,
    }),
    [user, loading, setUserFromLoginResponse, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}

// Función helper para obtener el token desde localStorage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn("No se pudo leer el token", error);
    return null;
  }
}

interface RequireModuleAccessProps {
  module: string;
  action?: PermissionAction;
  children: React.ReactNode;
}

export const RequireModuleAccess: React.FC<RequireModuleAccessProps> = ({
  module,
  action = "read",
  children,
}) => {
  const { hasPermission, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (!hasPermission(module, action)) return null;

  return <>{children}</>;
};


