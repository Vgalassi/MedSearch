import { Clinic } from "./types/Clinic";
import Link from "next/link";

interface Props {
  clinic: Clinic;
}

function formatAddress(clinic: Clinic) {
  return [clinic.street, clinic.number, clinic.city, clinic.state]
    .filter(Boolean)
    .join(", ");
}

export function ClinicCard({ clinic }: Props) {
  return (
    <article className="surface flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Clínica
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            {clinic.name}
          </h2>
        </div>
        {typeof clinic.distanceInKm === "number" && (
          <span className="rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
            {clinic.distanceInKm.toFixed(1)} km
          </span>
        )}
        {typeof clinic.distanceInKm !== "number" && (
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-teal-50 text-lg font-bold text-teal-700">
          +
          </span>
        )}
      </div>

      <p className="mt-4 leading-7 text-slate-600">
        {clinic.description || "Atendimento medico com equipe especializada."}
      </p>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-800">Endereco:</span>{" "}
          {formatAddress(clinic)}
        </p>
        <p>
          <span className="font-semibold text-slate-800">CEP:</span>{" "}
          {clinic.cep}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Telefone:</span>{" "}
          {clinic.phone}
        </p>
      </div>

      <Link className="btn-primary mt-6 w-full" href={`/patient/home/${clinic.id}`}>
        Ver detalhes
      </Link>
    </article>
  );
}
