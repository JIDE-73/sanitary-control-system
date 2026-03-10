"use client";

import { useRef, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";

type YesNoValue = "" | "si" | "no";

type YesNoFieldProps = {
  label: string;
  value: YesNoValue;
  onChange: (value: YesNoValue) => void;
};

function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <div className="space-y-2 text-sm">
      <p>{label}</p>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "si"}
            onChange={() => onChange(value === "si" ? "" : "si")}
            className="h-4 w-4"
          />
          Sí
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "no"}
            onChange={() => onChange(value === "no" ? "" : "no")}
            className="h-4 w-4"
          />
          No
        </label>
      </div>
      <input required value={value} onChange={() => {}} className="sr-only" />
    </div>
  );
}

export default function EntrevistaAfiliacionPage() {
  const [step, setStep] = useState(1);
  const [finalizado, setFinalizado] = useState(false);

  const [siNo, setSiNo] = useState<Record<string, YesNoValue>>({
    quedarteTijuana: "",
    fumas: "",
    ingieresAlcohol: "",
    utilizasDrogas: "",
    atencionPsiquiatrica: "",
    parejaActual: "",
    primeraRelacionVoluntaria: "",
    facilDecidirTsc: "",
    sabeTuFamilia: "",
    preferenciaCliente: "",
    condonClientes: "",
    experienciaDesagradable: "",
    sinCondonUltimosSeisMeses: "",
    riesgosExpones: "",
    positivaHiv: "",
  });

  const step1Ref = useRef<HTMLFieldSetElement>(null);
  const step2Ref = useRef<HTMLFieldSetElement>(null);
  const step3Ref = useRef<HTMLFieldSetElement>(null);

  const setSiNoValue = (key: string, value: YesNoValue) => {
    setSiNo((prev) => ({ ...prev, [key]: value }));
  };

  const validateCurrentStep = () => {
    const map = [step1Ref, step2Ref, step3Ref];
    const current = map[step - 1]?.current;
    if (!current) return false;

    const firstInvalid = current.querySelector(":invalid") as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.reportValidity();
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const finishForm = () => {
    if (!validateCurrentStep()) return;
    setFinalizado(true);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            CONTROL SANITARIO
          </h1>
          <p className="text-sm font-semibold">ENTREVISTA DE AFILIACION</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span
            className={step === 1 ? "font-semibold" : "text-muted-foreground"}
          >
            Sección 1
          </span>
          <span>/</span>
          <span
            className={step === 2 ? "font-semibold" : "text-muted-foreground"}
          >
            Sección 2
          </span>
          <span>/</span>
          <span
            className={step === 3 ? "font-semibold" : "text-muted-foreground"}
          >
            Sección 3
          </span>
        </div>

        {step === 1 && (
          <fieldset
            ref={step1Ref}
            className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-semibold">DATOS PERSONALES</h2>

            <label className="block text-sm">
              Escolaridad PR___ S___ P___ U___ Otra____________________
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Nombre artistico
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-sm font-semibold underline">
              Residencia en la Ciudad de Tijuana (Omitir en caso de ser
              residente)
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm">
                ¿Cuánto tiempo tienes en Tijuana? Años___
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Meses___
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Días___
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <YesNoField
              label="¿Piensas quedarte en Tijuana?"
              value={siNo.quedarteTijuana}
              onChange={(value) => setSiNoValue("quedarteTijuana", value)}
            />

            <label className="block text-sm">
              ¿Cuánto tiempo?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Por qué?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Por qué decidiste trabajar en Tijuana? ____Mejor paga ___Mayor
              trabajo ___Otro
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuál?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">2. Toxicologia</h3>

            <YesNoField
              label="¿Fumas?"
              value={siNo.fumas}
              onChange={(value) => setSiNoValue("fumas", value)}
            />
            <label className="block text-sm">
              ¿A qué edad empezaste?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Ingieres alcohol?"
              value={siNo.ingieresAlcohol}
              onChange={(value) => setSiNoValue("ingieresAlcohol", value)}
            />
            <label className="block text-sm">
              ¿A qué edad empezaste?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Utilizas drogas?"
              value={siNo.utilizasDrogas}
              onChange={(value) => setSiNoValue("utilizasDrogas", value)}
            />

            <label className="block text-sm">
              ¿Cuáles?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuánto tiempo?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">3.-Personalidad</h3>

            <label className="block text-sm">
              ¿Cómo disfrutas tu tiempo libre?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Cualidades:
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Qué es lo más importante para ti en la vida?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Qué te causa alegría?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <p className="text-sm">¿Has pensado o intentado suicidarte?</p>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4" />
                Nunca____
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4" />
                Algunas veces____
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4" />
                Muy a Menudo____
              </label>
            </div>

            <label className="block text-sm">
              Edad __
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Método
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="Recibió atención psicológica o psiquiátrica"
              value={siNo.atencionPsiquiatrica}
              onChange={(value) => setSiNoValue("atencionPsiquiatrica", value)}
            />

            <label className="block text-sm">
              Motivo:
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <p className="text-sm">
              Tomando todo en consideración, actualmente estoy:
            </p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                ___Satisfecha con mi vida
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                ___Moderadamente satisfecha con mi vida
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                ___Insatisfecha con mi vida
              </label>
            </div>

            <label className="block text-sm">
              ¿Cuáles son tus metas?
              <textarea
                required
                className="mt-1 min-h-20 w-full rounded-md border px-3 py-2"
              />
            </label>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset
            ref={step2Ref}
            className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
          >
            <h3 className="text-base font-semibold">
              4. Pareja (Omitir en caso de ser soltera) A partir de los 6 meses
            </h3>

            <YesNoField
              label="¿Tienes pareja sentimental actualmente?"
              value={siNo.parejaActual}
              onChange={(value) => setSiNoValue("parejaActual", value)}
            />

            <label className="block text-sm">
              ¿Cuánto tiempo tienen de relación?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Tu relación con tu pareja es? Muy Buena ___ Buena ___ Regular___
              Conflictiva ___ Muy conflictiva ___
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">5. Vida sexual</h3>

            <YesNoField
              label="¿Tu primera relación sexual fue voluntaria?"
              value={siNo.primeraRelacionVoluntaria}
              onChange={(value) =>
                setSiNoValue("primeraRelacionVoluntaria", value)
              }
            />

            <label className="block text-sm">
              ¿A qué edad tuviste tu primera relación sexual? ________ Años
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Qué tipo de relación tenías con esta persona?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">
              6. Trabajo sexo comercial (TSC)
            </h3>

            <label className="block text-sm">
              ¿Por qué decidiste trabajar como TSC?
              <textarea
                required
                className="mt-1 min-h-20 w-full rounded-md border px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              ¿Alguna persona te informo o te influyo para que trabajaras en
              TSC?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Consideras que fue fácil decidirte a trabajar en TSC?"
              value={siNo.facilDecidirTsc}
              onChange={(value) => setSiNoValue("facilDecidirTsc", value)}
            />

            <label className="block text-sm">
              ¿Por qué?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Si te ofrecieran un empleo fuera de TSC, ¿lo tomarías?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuánto tiempo tienes trabajando en TSC? ___ Años ___ Meses ___
              Semanas ___ Días
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Sabe tu familia?"
              value={siNo.sabeTuFamilia}
              onChange={(value) => setSiNoValue("sabeTuFamilia", value)}
            />

            <label className="block text-sm">
              ¿Quiénes?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              En tu trabajo ¿qué actividad desarrollas?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <p className="text-sm">
              Bailarina ___ Edecán ___ Cuartos ___ Fichas ___ Mesera ___
            </p>
            <div className="grid gap-4 md:grid-cols-5">
              <label className="text-sm">
                Bailarina
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Edecán
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Cuartos
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Fichas
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Mesera
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <label className="block text-sm">
              ¿A qué actividades sexuales accedes? Vaginal ___ Anal ___ Oral ___
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuántos clientes tienes por día?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuántas fichas realizas por día?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuánto cobras? Bailarina ______ Edecán ______ Cuartos ______
              Fichas ______ Mesera ______
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuántos días a la semana trabajas?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Tienes alguna preferencia por algún tipo de cliente?"
              value={siNo.preferenciaCliente}
              onChange={(value) => setSiNoValue("preferenciaCliente", value)}
            />

            <label className="block text-sm">
              ¿Qué tipo?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Utilizas condón con todos los clientes?"
              value={siNo.condonClientes}
              onChange={(value) => setSiNoValue("condonClientes", value)}
            />

            <label className="block text-sm">
              Alguna veces____
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset
            ref={step3Ref}
            className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
          >
            <YesNoField
              label="¿Has tenido alguna experiencia desagradable con algún cliente?"
              value={siNo.experienciaDesagradable}
              onChange={(value) =>
                setSiNoValue("experienciaDesagradable", value)
              }
            />

            <label className="block text-sm">
              ¿Qué tipo?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Has tenido relaciones sexuales sin condón en los ultimos seis meses?"
              value={siNo.sinCondonUltimosSeisMeses}
              onChange={(value) =>
                setSiNoValue("sinCondonUltimosSeisMeses", value)
              }
            />

            <label className="block text-sm">
              ¿Con quién?
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Tienes información acerca de las ITS? Bastante___ Regular___
              Poca___ Nada___
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Tienes información acerca del VIH-SIDA? Bastante___ Regular___
              Poca___ Nada___
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Has pensado en los riesgos a los que te expones?"
              value={siNo.riesgosExpones}
              onChange={(value) => setSiNoValue("riesgosExpones", value)}
            />

            <YesNoField
              label="¿Has pensado que podrías salir positiva en la prueba de HIV?"
              value={siNo.positivaHiv}
              onChange={(value) => setSiNoValue("positivaHiv", value)}
            />

            <label className="block text-sm">
              ¿Tomarías el tratamiento antirretroviral en caso de un resultado
              positivo? Sí ___ No ___ Tal vez ___
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              En caso de emergencia me puedes mencionar alguna persona de tu
              confianza (nombre, parentesco y teléfono)
              <textarea
                required
                className="mt-1 min-h-24 w-full rounded-md border px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              Senales Particulares
              <textarea
                required
                className="mt-1 min-h-24 w-full rounded-md border px-3 py-2"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm">
                Estatura
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Cabello
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Ojos
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Tez
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm md:col-span-2">
                Complexión
                <input
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <label className="block text-sm">
              Notas:
              <textarea
                required
                className="mt-1 min-h-24 w-full rounded-md border px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              Elaboro:
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Fecha de Elaboración: __/__/__
              <input
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>
          </fieldset>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Anterior
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              Siguiente sección
            </Button>
          ) : (
            <Button type="button" onClick={finishForm}>
              Finalizar entrevista
            </Button>
          )}
        </div>

        {finalizado && (
          <p className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
            Entrevista completada. Ya terminaste las 3 secciones de forma
            consecutiva.
          </p>
        )}
      </div>
    </MainLayout>
  );
}
