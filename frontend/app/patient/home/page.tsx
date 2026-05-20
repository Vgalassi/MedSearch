"use client";

import { ClinicCard } from "@/components/ClinicCard";
import { useEffect, useState } from "react";
import { Clinic } from "@/components/types/Clinic";

export default function PatientHomePage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const response = await fetch("http://localhost:3000/clinics/all");
        const resData = await response.json();
        setClinics(resData.clinics ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchClinics();
  }, []);

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Clinicas disponiveis</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">Encontre atendimento medico</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Confira clínicas cadastradas, veja detalhes de atendimento e
                escolha a melhor opção para sua consulta.
              </p>
            </div>
            <span className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-teal-50">
              {clinics.length} clínicas
            </span>
          </div>
        </section>

        {isFetching && (
          <p className="mt-8 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            Carregando clínicas...
          </p>
        )}

        {!isFetching && clinics.length === 0 && (
          <div className="surface mt-8 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              Nenhuma clínica encontrada
            </h2>
            <p className="mt-2 text-slate-600">
              Assim que novas clínicas forem cadastradas, elas aparecerão aqui.
            </p>
          </div>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </section>
      </div>
    </main>
  );
}
