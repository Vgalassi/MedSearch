'use client'
import { useActionState } from "react"
import createUser from "@/components/utils/CreateUser"
import { checkUserErrors } from "@/components/utils/checkUserErrors"
import { ClinicCreateFormData } from "@/components/types/UserFormData"

type FormState = {
  errors: string[] | null,
  enteredValues: ClinicCreateFormData | null
}

export default function LoginPage() {
  async function handleSubmit(prevFormState: FormState, formData: FormData): Promise<FormState> {
    const errors: string[] = []
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string
    const phone = formData.get("phone") as string
    const cep = formData.get("cep") as string
    const description = formData.get("description") as string
    const enteredValues: ClinicCreateFormData = 
    { name, email, password, confirmPassword, phone,role: "CLINIC",
     
        cep,
        description,
        latitude: 0.1,
        longitude: 0.1,
        address: "teste"
    }

    checkUserErrors(enteredValues,errors)
    if (errors.length > 0) {
      return { errors, enteredValues }
    }

    try {
      await createUser(enteredValues)
      
      return { errors: null, enteredValues: null }
    } catch (err: any) {
      return { 
        errors: ["Ocorreu um erro na hora de registrar"], 
        enteredValues 
      }
    }
  }

  const [formState, formAction,pending] = useActionState(handleSubmit, {
    errors: null,
    enteredValues: null
  })

  return (
    <div className="mx-auto my-4">
      <div className="border w-80 p-4 rounded">
        <form action={formAction}>
          <h1>Nova Clínica</h1>

          <label htmlFor="name">Nome</label>
          <input type="text" className="border block mb-2 p-1 w-full" name="name" id="name" defaultValue={formState.enteredValues?.name} />

          <label htmlFor="email">Email</label>
          <input type="email" className="border block mb-2 p-1 w-full" name="email" id="email" defaultValue={formState.enteredValues?.email} />

          <label htmlFor="phone">Telefone</label>
          <input className="border block mb-2 p-1 w-full" name="phone" id="phone" defaultValue={formState.enteredValues?.phone} />

          <label htmlFor="password">Senha</label>
          <input type="password" className="border block mb-2 p-1 w-full" name="password" id="password" defaultValue={formState.enteredValues?.password}/>

          <label htmlFor="confirm-password">Confirmar senha</label>
          <input type="password" className="border block mb-2 p-1 w-full" name="confirm-password" id="confirm-password" defaultValue={formState.enteredValues?.confirmPassword} />

          <label htmlFor="cep">CEP</label>
          <input type="text" className="border block mb-2 p-1 w-full" name="cep" id="cep" defaultValue={formState.enteredValues?.cep} />

          <label htmlFor="description">Descrição</label>
          <textarea className="border block mb-2 p-1 w-full" id="description" name="description" defaultValue={formState.enteredValues?.description} />

          <input
            className="border p-2 mt-4 w-full cursor-pointer hover:bg-black hover:text-white transition-colors"
            type="submit"
            value={pending ? "criando..." : "Registrar"}
          />
        </form>

        {formState.errors && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 rounded">
            {formState.errors.map((error, index) => (
              <p className="text-red-600 text-sm" key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}