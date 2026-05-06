import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="page-shell grid place-items-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-teal-950 p-8 text-white sm:p-10">
          <p className="section-kicker text-teal-200">Acesso MedSearch</p>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
            Entre para acompanhar consultas, medicos e clinicas.
          </h1>
          <p className="mt-5 leading-7 text-teal-50/80">
            
          </p>
        </section>

        <section className="p-8 sm:p-10">
          <form action="" className="mx-auto max-w-md">
            <div>
              <p className="section-kicker">Login</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                Bem-vindo de volta
              </h2>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input type="email" className="input" name="email" id="email" />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Senha
                </label>
                <input
                  type="password"
                  className="input"
                  name="password"
                  id="password"
                />
              </div>
            </div>

            <button className="btn-primary mt-7 w-full" type="submit">
              Entrar
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Ainda nao tem conta?{" "}
              <Link className="font-semibold text-teal-700" href="/patient/register">
                Cadastre-se
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
