"use client";

import { useActionState } from "react";
import createUser from "@/components/utils/CreateUser";
import { checkUserErrors } from "@/components/utils/checkUserErrors";
import { MedicCreateFormData } from "@/components/types/UserFormData";
import { RegisterPageShell } from "@/components/ui/RegisterPageShell";
import { FormErrors } from "@/components/ui/FormErrors";
import { FormField } from "@/components/ui/FormField";
import { FormTitle } from "@/components/ui/FormTitle";

type FormState = {
  errors: string[] | null;
  enteredValues: MedicCreateFormData | null;
};

export default function MedicRegisterPage() {
  async function handleSubmit(
    prevFormState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const errors: string[] = [];
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const phone = formData.get("phone") as string;
    const crm = formData.get("crm") as string;
    const speciality = formData.get("speciality") as string;


    const enteredValues: MedicCreateFormData = {
      name,
      email,
      password,
      confirmPassword,
      phone,
      role: "DOCTOR",
      crm,
      speciality,
    };

    checkUserErrors(enteredValues, errors);
    if (errors.length > 0) {
      return { errors, enteredValues };
    }

    const response =  await createUser(enteredValues);

    if( response.status == false){
      return {
        errors: [response.message],
        enteredValues,
      };
    }
    return { errors: null, enteredValues: null };
  }

  const [formState, formAction, pending] = useActionState(handleSubmit, {
    errors: null,
    enteredValues: null,
  });

  return (
    <RegisterPageShell
      introTitle="Cadastre seu perfil médico"
      introText="Fique visível para clínicas e pacientes, com especialidade e CRM organizados dentro do MedSearch."
    >
      <form action={formAction}>
        <FormTitle kicker="Médico" title="Novo médico" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <FormField
            defaultValue={formState.enteredValues?.name}
            id="name"
            label="Nome"
            name="name"
          />
          <FormField
            defaultValue={formState.enteredValues?.email}
            id="email"
            label="Email"
            name="email"
            type="email"
          />
          <FormField
            defaultValue={formState.enteredValues?.phone}
            id="phone"
            label="Telefone"
            name="phone"
          />
          <FormField
            defaultValue={formState.enteredValues?.crm}
            id="crm"
            label="CRM"
            name="crm"
          />
          <FormField
            defaultValue={formState.enteredValues?.password}
            id="password"
            label="Senha"
            name="password"
            type="password"
          />
          <FormField
            defaultValue={formState.enteredValues?.confirmPassword}
            id="confirm-password"
            label="Confirmar senha"
            name="confirm-password"
            type="password"
          />
          <div className="sm:col-span-2">
              <label htmlFor="speciality" className="block text-sm font-medium">
                Especialidade
              </label>

              <select
                id="speciality"
                name="speciality"
                defaultValue={formState.enteredValues?.speciality || ""}
                className="mt-1 block w-full rounded-md border px-3 py-2"
              >
                <option value="">Selecione uma especialidade</option>
                <option value="CARDIOLOGIA">Cardiologia</option>
                <option value="DERMATOLOGIA">Dermatologia</option>
                <option value="PEDIATRIA">Pediatria</option>
                <option value="ORTOPEDIA">Ortopedia</option>
                <option value="NEUROLOGIA">Neurologia</option>
                <option value="GINECOLOGIA">Ginecologia</option>
                <option value="PSIQUIATRIA">Psiquiatria</option>
                <option value="CLINICO_GERAL">Clínico Geral</option>
              </select>
          </div>
        </div>

        <button className="btn-primary mt-7 w-full" disabled={pending} type="submit">
          {pending ? "Criando..." : "Registrar médico"}
        </button>
      </form>

      <FormErrors errors={formState.errors} />
    </RegisterPageShell>
  );
}
