"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Doctor } from "@/components/types/Doctor";
import { ClinicDoctorSection } from "@/components/ClinicDoctorSection";
import { API_BASE_URL } from "@/components/appConfig";
import { useAuth } from "@/context/AuthContext";

export default function ClinicHomePage() {
  const { user, loading } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [myDoctors, setMyDoctors] = useState<Doctor[]>([]);
  const [pendingDoctorIds, setPendingDoctorIds] = useState<Set<string>>(new Set());
  const clinicId = user?.role === "CLINIC" ? user.profileId : null;

  const loadDoctors = useCallback(async () => {
    if (!clinicId) {
      throw new Error("Entre como clínica para gerenciar médicos");
    }

    const [allDoctorsResponse, clinicDoctorsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/doctors/all`),
      fetch(`${API_BASE_URL}/clinics/doctors/${clinicId}`),
    ]);

    const allDoctorsData = await allDoctorsResponse.json();
    const clinicDoctorsData = await clinicDoctorsResponse.json();

    return {
      allDoctors: allDoctorsData.doctors ?? [],
      clinicDoctors: clinicDoctorsData.doctors ?? [],
    };
  }, [clinicId]);

  useEffect(() => {
    if (loading) return;

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
  }, [loading, loadDoctors]);

  const myDoctorIds = useMemo(
    () => new Set(myDoctors.map((doctor) => doctor.id)),
    [myDoctors],
  );

  const availableDoctors = doctors.filter((doctor) => !myDoctorIds.has(doctor.id));

  async function addDoctor(doctorId: string) {
    if (!clinicId) return;

    const response = await fetch(
      `${API_BASE_URL}/clinic/add-doctor/${clinicId}`,
      {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ doctorId }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message ?? "Não foi possível enviar a solicitação");
    }
    setPendingDoctorIds((current) => new Set(current).add(doctorId));
  }

  async function removeDoctor(doctorId: string) {
    if (!clinicId) return;

    const response = await fetch(
      `${API_BASE_URL}/clinic/remove-doctor/${clinicId}`,
      {
        method: "PUT",
        credentials: "include",
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
          <p className="section-kicker text-teal-200">Painel da clínica</p>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold">Gerencie seu corpo médico</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Adicione médicos disponiíveis a clínica ou remova profissionais
                que não fazem mais parte da equipe.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <span className="rounded-md bg-white/10 px-4 py-3">
                <strong className="block text-2xl">{myDoctors.length}</strong>
                <span className="text-sm text-teal-50/80">na clínica</span>
              </span>
              <span className="rounded-md bg-white/10 px-4 py-3">
                <strong className="block text-2xl">{availableDoctors.length}</strong>
                <span className="text-sm text-teal-50/80">disponíveis</span>
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
            emptyText="Nenhum médico foi adicionado a esta clínica ainda."
            isFetching={isFetching}
            kicker="Equipe atual"
            onAction={removeDoctor}
            title="Médicos da clínica"
          />

          <ClinicDoctorSection
            actionLabel="Adicionar"
            doctors={availableDoctors}
            emptyText="Todos os médicos já estão vinculados a esta clínica."
            isFetching={isFetching}
            kicker="Rede MedSearch"
            onAction={addDoctor}
            pendingDoctorIds={pendingDoctorIds}
            title="Médicos disponíveis"
          />
        </section>
      </div>
    </main>
  );
}
