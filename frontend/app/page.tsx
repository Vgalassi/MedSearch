import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-teal-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.32),transparent_34%),linear-gradient(135deg,rgba(8,47,73,0.78),rgba(15,23,42,0.96))]" />
        <div className="content-shell relative grid min-h-[calc(100vh-72px)] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="section-kicker text-teal-200">MedSearch</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Consultas medicas com busca, agenda e gestao em um so lugar.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-teal-50/85 sm:text-lg">
              Uma plataforma para pacientes encontrarem clinicas, conhecerem
              medicos disponiveis e acompanharem o agendamento online. Para
              clinicas, o MedSearch organiza o corpo medico e simplifica a
              rotina de atendimento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/patient/home" className="btn-primary bg-white text-teal-900 hover:bg-teal-50">
                Procurar clinicas
              </Link>
              <Link href="/clinic/register" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                Cadastrar clinica
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur">
              <div className="rounded-md bg-white p-4 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">
                      Agenda de hoje
                    </p>
                    <p className="text-2xl font-bold">18 consultas</p>
                  </div>
                  <span className="rounded-md bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                    Online
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["09:00", "Cardiologia", "Confirmada"],
                    ["10:30", "Clinica geral", "Aguardando"],
                    ["14:00", "Dermatologia", "Confirmada"],
                  ].map(([time, speciality, status]) => (
                    <div
                      className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-3"
                      key={time}
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{time}</p>
                        <p className="text-sm text-slate-500">{speciality}</p>
                      </div>
                      <span className="text-sm font-medium text-teal-700">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-cyan-50 p-4">
                    <p className="text-sm text-slate-500">Medicos</p>
                    <p className="text-2xl font-bold text-cyan-800">42</p>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-4">
                    <p className="text-sm text-slate-500">Clinicas</p>
                    <p className="text-2xl font-bold text-emerald-800">16</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="content-shell">
          <p className="section-kicker">Como funciona</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Encontre", "Compare clinicas por localizacao, descricao e especialidades disponiveis."],
              ["Agende", "Escolha o medico e acompanhe os horarios livres com regras claras de agenda."],
              ["Gerencie", "Clinicas adicionam e removem medicos do time sem perder visibilidade."],
            ].map(([title, text]) => (
              <article className="surface p-6" key={title}>
                <h2 className="text-xl font-bold text-slate-950">{title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
