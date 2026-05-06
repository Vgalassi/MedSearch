"use client";

import { useActionState } from "react";
import createUser from "@/components/utils/CreateUser";
import { checkUserErrors } from "@/components/utils/checkUserErrors";
import { ClinicCreateFormData } from "@/components/types/UserFormData";
import { RegisterPageShell } from "@/components/ui/RegisterPageShell";
import { FormErrors } from "@/components/ui/FormErrors";
import { FormField } from "@/components/ui/FormField";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { FormTitle } from "@/components/ui/FormTitle";

type FormState = {
  errors: string[] | null;
  enteredValues: ClinicCreateFormData | null;
};

export default function ClinicRegisterPage() {
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
    const cep = formData.get("cep") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const enteredValues: ClinicCreateFormData = {
      name,
      email,
      password,
      confirmPassword,
      phone,
      role: "CLINIC",
      cep,
      description,
      latitude: 0.1,
      longitude: 0.1,
      address,
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
      introTitle="Cadastre sua clinica"
      introText="Apresente sua estrutura, gerencie medicos vinculados e facilite o acesso de pacientes ao atendimento."
    >
      <form action={formAction}>
        <FormTitle kicker="Clinica" title="Nova clinica" />

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
            defaultValue={formState.enteredValues?.cep}
            id="cep"
            label="CEP"
            name="cep"
          />
          <div className="sm:col-span-2">
            <FormField
              defaultValue={formState.enteredValues?.address}
              id="address"
              label="Endereco"
              name="address"
            />
          </div>
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
              defaultValue={formState.enteredValues?.description}
              id="description"
              label="Descricao"
              minHeightClassName="min-h-28"
              name="description"
            />
          </div>
        </div>

        <button className="btn-primary mt-7 w-full" disabled={pending} type="submit">
          {pending ? "Criando..." : "Registrar clinica"}
        </button>
      </form>

      <FormErrors errors={formState.errors} />
    </RegisterPageShell>
  );
}
