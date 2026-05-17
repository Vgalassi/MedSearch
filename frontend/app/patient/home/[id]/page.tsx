"use client";

import { Clinic } from "@/components/types/Clinic";
import { useState, useEffect } from "react";
import { Doctor } from "@/components/types/Doctor";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ClinicDetails() {
  const params = useParams<{ id: string }>();

  const [clinic, setClinic] = useState<Clinic>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    if (!params?.id) return;

    async function fetchData() {
      try {
        const clinicRes = await fetch(
          `http://localhost:3000/clinics/find/${params.id}`,
        );
        const clinicData = await clinicRes.json();
        setClinic(clinicData);

        const doctorRes = await fetch(
          `http://localhost:3000/clinics/doctors/${params.id}`,
        );
        const doctorData = await doctorRes.json();
        setDoctors(doctorData.doctors ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchData();
  }, [params?.id]);

  return (
    <main className="page-shell">
      <div className="content-shell">
        {isFetching && (
          <p className="rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            Carregando informacoes...
          </p>
        )}

        {clinic && (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg bg-teal-950 p-8 text-white shadow-lg shadow-slate-200/70">
              <p className="section-kicker text-teal-200">Detalhes da clinica</p>
              <h1 className="mt-4 text-4xl font-bold">{clinic.name}</h1>
              <p className="mt-5 max-w-3xl leading-8 text-teal-50/85">
                {clinic.description}
              </p>
            </div>

            <aside className="surface p-6">
              <h2 className="text-xl font-bold text-slate-950">Informações</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Telefone</dt>
                  <dd className="mt-1 text-slate-900">{clinic.phone}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Endereço</dt>
                  <dd className="mt-1 text-slate-900">{clinic.address}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">CEP</dt>
                  <dd className="mt-1 text-slate-900">{clinic.cep}</dd>
                </div>
              </dl>
            </aside>
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">Corpo médico</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Médicos desta clínica
              </h2>
            </div>
            <span className="rounded-md bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              {doctors.length} médicos
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <article className="surface p-5" key={doctor.id}>
                <p className="text-sm font-semibold text-teal-700">
                  {doctor.speciality}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  {doctor.name}
                </h3>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>CRM: {doctor.crm}</p>
                  <p>Telefone: {doctor.phone}</p>
                </div>
                <Link
                  className="btn-primary mt-5 w-full"
                  href={`/patient/home/${params.id}/${doctor.id}`}
                >
                  Agendar consulta
                </Link>
              </article>
            ))}
          </div>

          {!isFetching && doctors.length === 0 && (
            <div className="surface mt-5 p-8 text-center text-slate-600">
              Esta clinica ainda nao possui medicos vinculados.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
