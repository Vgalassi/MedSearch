"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/components/appConfig";
import { SPECIALITIES } from "@/components/constants/specialities";
import { useAuth } from "@/context/AuthContext";

type Profile = {
  role: "PATIENT" | "DOCTOR" | "CLINIC";
  email: string;
  name: string;
  phone: string;
  cpf?: string;
  crm?: string;
  speciality?: string;
  cep?: string;
  number?: string;
  street?: string;
  city?: string;
  state?: string;
  description?: string;
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    fetch(`${API_BASE_URL}/users/profile`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar seus dados.");
        setProfile(await response.json());
      })
      .catch((error: Error) => setMessage({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  }, [authLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };
    if (profile.role === "DOCTOR") payload.speciality = String(formData.get("speciality") ?? "");
    if (profile.role === "CLINIC") {
      payload.cep = String(formData.get("cep") ?? "");
      payload.number = String(formData.get("number") ?? "");
      payload.description = String(formData.get("description") ?? "");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Não foi possível salvar os dados.");
      const refreshedResponse = await fetch(`${API_BASE_URL}/users/profile`, { credentials: "include" });
      if (refreshedResponse.ok) setProfile(await refreshedResponse.json());
      setMessage({ type: "success", text: data.message });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <main className="page-shell"><div className="content-shell">Carregando dados...</div></main>;
  if (!profile) return <main className="page-shell"><div className="content-shell text-rose-700">{message?.text}</div></main>;

  return (
    <main className="page-shell">
      <div className="content-shell max-w-3xl">
        <div className="mb-6">
          <p className="section-kicker">Minha conta</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Ver e alterar dados</h1>
          <p className="mt-2 text-slate-600">Os campos identificadores aparecem apenas para consulta.</p>
        </div>

        <form className="surface p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" name="name" defaultValue={profile.name} required />
            <Field label="E-mail" name="email" defaultValue={profile.email} readOnly />
            <Field label="Telefone" name="phone" defaultValue={profile.phone} required />
            {profile.role === "PATIENT" && <Field label="CPF" name="cpf" defaultValue={profile.cpf} readOnly />}
            {profile.role === "DOCTOR" && <Field label="CRM" name="crm" defaultValue={profile.crm} readOnly />}
            {profile.role === "DOCTOR" && (
              <div>
                <label className="label" htmlFor="speciality">Especialidade</label>
                <select className="input" id="speciality" name="speciality" defaultValue={profile.speciality} required>
                  {SPECIALITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            )}
            {profile.role === "CLINIC" && <Field label="CEP" name="cep" defaultValue={profile.cep} required />}
            {profile.role === "CLINIC" && <Field label="Número" name="number" defaultValue={profile.number} required />}
            {profile.role === "CLINIC" && <Field label="Logradouro" name="street" defaultValue={profile.street} readOnly />}
            {profile.role === "CLINIC" && <Field label="Cidade/UF" name="city" defaultValue={`${profile.city} - ${profile.state}`} readOnly />}
            {profile.role === "CLINIC" && (
              <div className="sm:col-span-2">
                <label className="label" htmlFor="description">Descrição</label>
                <textarea className="input min-h-32" id="description" name="description" defaultValue={profile.description} required />
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button className="btn-primary" disabled={saving} type="submit">{saving ? "Salvando..." : "Salvar alterações"}</button>
            {message && <p className={message.type === "success" ? "text-sm font-medium text-teal-700" : "text-sm font-medium text-rose-700"}>{message.text}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, name, defaultValue, readOnly = false, required = false }: {
  label: string; name: string; defaultValue?: string; readOnly?: boolean; required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        className={`input ${readOnly ? "border-slate-200 bg-slate-100 text-slate-500" : ""}`}
        defaultValue={defaultValue}
        id={name}
        name={name}
        readOnly={readOnly}
        required={required}
      />
    </div>
  );
}
