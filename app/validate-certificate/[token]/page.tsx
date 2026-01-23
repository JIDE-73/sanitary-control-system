"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

interface ValidationResponse {
  message: string;
  digitalCertificate: {
    id: string;
    afiliado_id: string;
    motivo: string;
    activa: boolean;
    fecha: string;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function ValidateCertificatePage({ params }: PageProps) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/sics/certificateA/validateDigitalCertificate`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: ValidationResponse = await response.json();
        setValidation(data);
      } catch (err) {
        console.error("Error al validar el certificado", err);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo validar el certificado. Intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Validación de Certificado Digital
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sistema de Control Sanitario
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Validando certificado...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Error de validación
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && validation && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                {validation.digitalCertificate.activa ? (
                  <>
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                      <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        Usuario Vigente
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        El certificado digital está activo y válido
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                      <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        Usuario No Vigente
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {validation.message || "El certificado digital no está activo"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

