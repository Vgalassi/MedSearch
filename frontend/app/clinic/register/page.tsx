'use client'
import { useActionState } from "react"
import createUser from "@/components/CreateUser"
type FormState = {
  errors: string[] | null
}


export default function LoginPage() {

  async function handleSubmit(prevFormState: FormState, formData: FormData): Promise<FormState> {
    const errors: string[] = []

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string
    const name = formData.get("name")
    const cep = formData.get("cep")
    const description = formData.get("description")
    const phone = formData.get("phone")
    const email = formData.get("email")

    if (password !== confirmPassword) {
      errors.push("As senhas não estão iguais")
    }

    if (errors.length > 0) {
      return { errors }
    }
    const data = Object.fromEntries(formData)
    await createUser(
    {
        name,
        password,
        phone,
        email,
        role: "CLINIC",
        roleData: {
            address: "teste",
            cep,
            latitude: 0.1,
            longitude: 0.2,
            description


        }
    })
    return { errors: null }
  }

  const [formState, formAction] = useActionState(handleSubmit, {
    errors: null,
  })

  return (
    <div className="mx-auto my-4">
      <div className="border w-80 p-4 rounded">
        <form action={formAction}>
          <h1>Login</h1>

          <label htmlFor="name">Nome</label>
          <input type="text" className="input" name="name" id="name" />

          <label htmlFor="email">Email</label>
          <input type="email" className="input" name="email" id="email" />

            <label htmlFor="phone">Telefone</label>
          <input  className="input" name="phone" id="phone" />

          <label htmlFor="password">Senha</label>
          <input type="password" className="input" name="password" id="password" />

          <label htmlFor="confirm-password">Confirmar senha</label>
          <input type="password" className="input" name="confirm-password" id="confirm-password" />

          <label htmlFor="cep">CEP</label>
          <input type="text" className="input" name="cep" id="cep" />

          <label htmlFor="description">Descrição</label>
          <textarea className="input" id="description" name="description" />

          <input
            className="border p-2 m-2 mx-auto cursor-pointer hover:bg-black hover:text-white"
            type="submit"
            value="Entrar"
          />
        </form>
        {formState.errors && (
          <div className="mt-2 text-red-500">
            {formState.errors.map((error, index) => (
              <p className="text-red" key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}