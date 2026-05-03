"use client";

import { useActionState } from "react";
import createUser from "@/components/utils/CreateUser";
import { checkUserErrors } from "@/components/utils/checkUserErrors";
import { PatientCreateFormData } from "@/components/types/UserFormData";
import { RegisterPageShell } from "@/components/ui/RegisterPageShell";
import { FormErrors } from "@/components/ui/FormErrors";
import { FormField } from "@/components/ui/FormField";
import { FormTitle } from "@/components/ui/FormTitle";

type FormState = {
  errors: string[] | null;
  enteredValues: PatientCreateFormData | null;
};

export default function PatientRegisterPage() {
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
    const cpf = formData.get("cpf") as string;

    const enteredValues: PatientCreateFormData = {
      name,
      email,
      password,
      confirmPassword,
      phone,
      role: "PATIENT",
      cpf,
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
      introTitle="Crie sua conta de paciente"
      introText="Encontre clinicas, veja o corpo medico e prepare seu proximo agendamento pelo MedSearch."
    >
      <form action={formAction}>
        <FormTitle kicker="Paciente" title="Novo paciente" />

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
            defaultValue={formState.enteredValues?.cpf}
            id="cpf"
            label="CPF"
            name="cpf"
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
        </div>

        <button className="btn-primary mt-7 w-full" disabled={pending} type="submit">
          {pending ? "Criando..." : "Registrar paciente"}
        </button>
      </form>

      <FormErrors errors={formState.errors} />
    </RegisterPageShell>
  );
}
