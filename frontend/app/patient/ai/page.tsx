"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/components/appConfig";
import { ClinicCard } from "@/components/ClinicCard";
import type { Clinic } from "@/components/types/Clinic";
import { useAuth } from "@/context/AuthContext";

type AnalysisResult = {
  speciality: string;
  confidence: number;
  clinics: Clinic[];
  disclaimer: string;
};

type Coordinates = { latitude: number; longitude: number };

export default function PatientAiPage() {
  const { user, loading } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Seu navegador não suporta geolocalizacao.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setLocationError("Precisamos da sua localizacao para ordenar as clínicas mais próximas."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  async function analyzeSymptoms(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!coordinates) {
      setError("Autorize sua localização antes de solicitar a recomendação.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/symptoms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, ...coordinates }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message ?? "Não foi possível determinar com precisão a especialidade.",
        );
      }
      setResult(data as AnalysisResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado.");
    } finally {
      setIsSending(false);
    }
  }

  if (loading) return null;

  if (user?.role !== "PATIENT") {
    return (
      <main className="page-shell"><div className="content-shell"><section className="surface p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Área exclusiva para pacientes</h1>
        <p className="mt-3 text-slate-600">Entre com uma conta de paciente para usar o assistente de sintomas.</p>
        <Link className="btn-primary mt-6" href="/login">Ir para login</Link>
      </section></div></main>
    );
  }

  return (
    <main className="page-shell"><div className="content-shell">
      <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
        <p className="section-kicker text-teal-200">Assistente de sintomas</p>
        <h1 className="mt-4 text-3xl font-bold">Encontre a área clínica adequada</h1>
        <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">Descreva o que esta sentindo. A IA identifica a especialidade mais indicada e mostra clínicas próximas com profissionais dessa área.</p>
      </section>

      <section className="surface mt-6 p-6 sm:p-8">
        <form onSubmit={analyzeSymptoms}>
          <label className="label" htmlFor="symptoms">Quais sintomas você está sentindo?</label>
          <textarea className="input min-h-32 resize-y" id="symptoms" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} minLength={5} maxLength={2000} placeholder="Ex.: Estou com tosse seca, febre e falta de ar ha dois dias." required />
          {locationError && <p className="mt-3 text-sm text-amber-700">{locationError}</p>}
          <button className="btn-primary mt-5" disabled={isSending || !coordinates} type="submit">{isSending ? "Analisando..." : "Analisar sintomas"}</button>
        </form>
      </section>

      {error && <p className="mt-6 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">{error}</p>}
      {result && <section className="mt-6">
        <div className="rounded-lg border border-teal-100 bg-teal-50 p-6">
          <p className="section-kicker">Área sugerida</p>
          <h2 className="mt-2 text-2xl font-bold text-teal-950">{result.speciality}</h2>
          <p className="mt-3 text-sm leading-6 text-teal-900">{result.disclaimer}</p>
        </div>
        {result.clinics.length > 0 ? <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{result.clinics.map((clinic) => <ClinicCard clinic={clinic} key={clinic.id} />)}</section> : <div className="surface mt-6 p-8 text-center"><h2 className="text-xl font-bold text-slate-950">Nenhuma clínica encontrada</h2><p className="mt-2 text-slate-600">Ainda não há clinicas cadastradas com médicos de {result.speciality}.</p></div>}
      </section>}
    </div></main>
  );
}
