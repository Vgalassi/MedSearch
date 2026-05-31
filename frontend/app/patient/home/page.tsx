"use client";

import { ClinicCard } from "@/components/ClinicCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Clinic } from "@/components/types/Clinic";
import { API_BASE_URL } from "@/components/appConfig";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function PatientHomePage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [search, setSearch] = useState("");
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

    if (coordinates) {
      params.set("latitude", String(coordinates.latitude));
      params.set("longitude", String(coordinates.longitude));
    }

    return params.toString();
  }, [coordinates, debouncedSearch, page]);


  useEffect(() => {

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

      },
      () => {
        setLocationError(
          "Nao foi possivel obter sua localizacao."
        );
      }
    );

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

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Seu navegador nao suporta geolocalizacao.");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setPage(1);
      },
      () => setLocationError("Nao foi possivel obter sua localizacao."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
                Confira clinicas cadastradas, veja detalhes de atendimento e
                escolha a melhor opcao para sua consulta.
              </p>
            </div>
            <span className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-teal-50">
              {totalClinics} clinicas
            </span>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Pesquisar clinicas
            </span>
            <input
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, cidade, endereco ou CEP"
              type="search"
              value={search}
            />
          </label>
          <button
            className="btn-primary h-12 px-5"
            onClick={useCurrentLocation}
            type="button"
          >
            Usar minha localizacao
          </button>
        </section>

        {locationError && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {locationError}
          </p>
        )}

        {isFetching && (
          <p className="mt-8 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            Carregando clinicas...
          </p>
        )}

        {!isFetching && clinics.length === 0 && (
          <div className="surface mt-8 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              Nenhuma clinica encontrada
            </h2>
            <p className="mt-2 text-slate-600">
              Ajuste a pesquisa ou aguarde novas clinicas cadastradas.
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
              Pagina {page} de {totalPages}
            </span>
            <button
              className="btn-secondary px-4 py-2"
              disabled={page === totalPages || isFetching}
              onClick={() =>
                setPage((currentPage) => Math.min(currentPage + 1, totalPages))
              }
              type="button"
            >
              Proxima
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
