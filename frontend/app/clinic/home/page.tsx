"use client";

import { useEffect, useMemo, useState } from "react";
import { Doctor } from "@/components/types/Doctor";
import { ClinicDoctorSection } from "@/components/ClinicDoctorSection";

const CLINIC_ID = "3d1ef301-70fd-46f6-8478-7a20e08d1615";

export default function ClinicHomePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [myDoctors, setMyDoctors] = useState<Doctor[]>([]);

  async function loadDoctors() {
    const [allDoctorsResponse, clinicDoctorsResponse] = await Promise.all([
      fetch("http://localhost:3000/doctors/all"),
      fetch(`http://localhost:3000/clinics/doctors/${CLINIC_ID}`),
    ]);

    const allDoctorsData = await allDoctorsResponse.json();
    const clinicDoctorsData = await clinicDoctorsResponse.json();

    return {
      allDoctors: allDoctorsData.doctors ?? [],
      clinicDoctors: clinicDoctorsData.doctors ?? [],
    };
  }

  useEffect(() => {
    async function fetchInitialDoctors() {
      try {
        const data = await loadDoctors();
        setDoctors(data.allDoctors);
        setMyDoctors(data.clinicDoctors);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchInitialDoctors();
  }, []);

  const myDoctorIds = useMemo(
    () => new Set(myDoctors.map((doctor) => doctor.id)),
    [myDoctors],
  );

  const availableDoctors = doctors.filter((doctor) => !myDoctorIds.has(doctor.id));

  async function addDoctor(doctorId: string) {
    const response = await fetch(
      `http://localhost:3000/clinic/add-doctor/${CLINIC_ID}`,
      {
        method: "PUT",
        body: JSON.stringify({ doctorId }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status !== 200) {
      throw new Error("failed to add doctor");
    }

    await refreshDoctors();
  }

  async function removeDoctor(doctorId: string) {
    const response = await fetch(
      `http://localhost:3000/clinic/remove-doctor/${CLINIC_ID}`,
      {
        method: "PUT",
        body: JSON.stringify({ doctorId }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status !== 200) {
      throw new Error("failed to remove doctor");
    }

    await refreshDoctors();
  }

  async function refreshDoctors() {
    setIsFetching(true);

    try {
      const data = await loadDoctors();
      setDoctors(data.allDoctors);
      setMyDoctors(data.clinicDoctors);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Painel da clinica</p>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold">Gerencie seu corpo medico</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Adicione médicos disponiíveis a clínica ou remova profissionais
                que nao fazem mais parte da equipe.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <span className="rounded-md bg-white/10 px-4 py-3">
                <strong className="block text-2xl">{myDoctors.length}</strong>
                <span className="text-sm text-teal-50/80">na clínica</span>
              </span>
              <span className="rounded-md bg-white/10 px-4 py-3">
                <strong className="block text-2xl">{availableDoctors.length}</strong>
                <span className="text-sm text-teal-50/80">disponiveis</span>
              </span>
            </div>
          </div>
        </section>

        {isFetching && (
          <p className="mt-8 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            Carregando médicos...
          </p>
        )}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">
          <ClinicDoctorSection
            actionLabel="Remover"
            actionStyle="danger"
            doctors={myDoctors}
            emptyText="Nenhum medico foi adicionado a esta clinica ainda."
            isFetching={isFetching}
            kicker="Equipe atual"
            onAction={removeDoctor}
            title="Medicos da clinica"
          />

          <ClinicDoctorSection
            actionLabel="Adicionar"
            doctors={availableDoctors}
            emptyText="Todos os medicos ja estao vinculados a esta clinica."
            isFetching={isFetching}
            kicker="Rede MedSearch"
            onAction={addDoctor}
            title="Medicos disponiveis"
          />
        </section>
      </div>
    </main>
  );
}
