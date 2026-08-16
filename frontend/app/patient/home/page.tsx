"use client";

import { ClinicCard } from "@/components/ClinicCard";
import { useEffect, useMemo, useState } from "react";
import { Clinic } from "@/components/types/Clinic";
import { API_BASE_URL } from "@/components/appConfig";
import { SPECIALITIES } from "@/components/constants/specialities";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function PatientHomePage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClinics, setTotalClinics] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "12",
    });

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (speciality) {
      params.set("speciality", speciality);
    }

    if (coordinates) {
      params.set("latitude", String(coordinates.latitude));
      params.set("longitude", String(coordinates.longitude));
    }

    return params.toString();
  }, [coordinates, debouncedSearch, page, speciality]);


  useEffect(() => {
    let active = true;

    if (!navigator.geolocation) {
      queueMicrotask(() => {
        if (active) {
          setLocationError("Seu navegador não oferece suporte à localização.");
        }
      });

      return () => {
        active = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;

        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);

      },
      (error) => {
        if (!active) return;

        const message =
          error.code === error.PERMISSION_DENIED
            ? "A permissão de localização foi negada. Autorize o acesso nas configurações do navegador."
            : error.code === error.TIMEOUT
              ? "A localização demorou para responder. Recarregue a página para tentar novamente."
              : "Não foi possível obter sua localização. Verifique se a localização do dispositivo está ativada.";

        setLocationError(message);
      },
      {
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 5 * 60_000,
      },
    );

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {

    async function fetchClinics() {
      setIsFetching(true);

      try {
        const response = await fetch(`${API_BASE_URL}/clinics?${queryString}`);
        const resData = await response.json();
        setClinics(resData.clinics ?? []);
        setTotalPages(resData.pagination?.totalPages ?? 1);
        setTotalClinics(resData.pagination?.total ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchClinics();
  }, [queryString]);

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Clínicas disponíveis</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">Encontre atendimento médico</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Confira clínicas cadastradas, veja detalhes de atendimento e
                escolha a melhor opção para sua consulta.
              </p>
            </div>
            <span className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-teal-50">
              {totalClinics} clínicas
            </span>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2 md:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Pesquisar clínicas
            </span>
            <input
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, cidade, endereço ou CEP"
              type="search"
              value={search}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Especialidade médica</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => { setSpeciality(event.target.value); setPage(1); }}
              value={speciality}
            >
              <option value="">Todas as especialidades</option>
              {SPECIALITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </section>

        {locationError && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {locationError}
          </p>
        )}

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
              Ajuste os filtros ou aguarde novas clínicas cadastradas.
            </p>
          </div>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </section>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              className="btn-secondary px-4 py-2"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              type="button"
            >
              Anterior
            </button>
            <span className="text-sm font-semibold text-slate-600">
              Página {page} de {totalPages}
            </span>
            <button
              className="btn-secondary px-4 py-2"
              disabled={page === totalPages || isFetching}
              onClick={() =>
                setPage((currentPage) => Math.min(currentPage + 1, totalPages))
              }
              type="button"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
