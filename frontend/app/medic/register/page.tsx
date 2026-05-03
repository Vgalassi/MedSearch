"use client";

import { useActionState } from "react";
import createUser from "@/components/utils/CreateUser";
import { checkUserErrors } from "@/components/utils/checkUserErrors";
import { MedicCreateFormData } from "@/components/types/UserFormData";
import { RegisterPageShell } from "@/components/ui/RegisterPageShell";
import { FormErrors } from "@/components/ui/FormErrors";
import { FormField } from "@/components/ui/FormField";
import { FormTextarea } from "@/components/ui/FormTextarea";
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

    try {
      await createUser(enteredValues);

      return { errors: null, enteredValues: null };
    } catch {
      return {
        errors: ["Ocorreu um erro na hora de registrar"],
        enteredValues,
      };
    }
  }

  const [formState, formAction, pending] = useActionState(handleSubmit, {
    errors: null,
    enteredValues: null,
  });

  return (
    <RegisterPageShell
      introTitle="Cadastre seu perfil medico"
      introText="Fique visivel para clinicas e pacientes, com especialidade e CRM organizados dentro do MedSearch."
    >
      <form action={formAction}>
        <FormTitle kicker="Medico" title="Novo medico" />

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
            <FormTextarea
              defaultValue={formState.enteredValues?.speciality}
              id="speciality"
              label="Especialidade"
              name="speciality"
            />
          </div>
        </div>

        <button className="btn-primary mt-7 w-full" disabled={pending} type="submit">
          {pending ? "Criando..." : "Registrar medico"}
        </button>
      </form>

      <FormErrors errors={formState.errors} />
    </RegisterPageShell>
  );
}
