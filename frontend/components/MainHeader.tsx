"use client"
import Link from "next/link";
import LinkDropdown from "./LinkDropdown";
import { useAuth } from "@/context/AuthContext";

export default function MainHeader() {
  const {user} = useAuth()
  
  const registerUrls = [
    {
      href: "/patient/register",
      label: "Sou paciente",
    },
    {
      href: "/medic/register",
      label: "Sou medico",
    },
    {
      href: "/clinic/register",
      label: "Sou clinica",
    },
  ];

  const authUrls = [
    {
      href: "/user/logout",
      label: "Sair"
    }
  ]

  console.log(user)
  
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-teal-700 text-lg font-black text-white shadow-sm">
            M
          </span>
          <span className="text-lg font-bold text-slate-950">MedSearch</span>
        </Link>
        {!user &&
        <nav className="flex items-center gap-2">
          
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            href="/patient/home"
          >
            Clinicas
          </Link>
          <LinkDropdown title="Registrar" urls={registerUrls} />
          <Link className="btn-primary px-3 py-2" href="/login">
            Login
          </Link>
        </nav>
      }

      {user?.role === "PATIENT" &&
        <nav className="flex items-center gap-2">
          
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            href="/patient/home"
          >
            Clinicas
          </Link>
          <Link className="btn-primary px-3 py-2" href="/patient/appointments">
            Ver Consultas
          </Link>
          <LinkDropdown title={user.email} urls={authUrls} />
        </nav>
      }

      {user?.role === "MEDIC" &&
        <nav className="flex items-center gap-2">
          
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            href="/patient/home"
          >
            Clinicas
          </Link>
          <LinkDropdown title="Registrar" urls={registerUrls} />
          <Link className="btn-primary px-3 py-2" href="/login">
            Login
          </Link>
        </nav>
      }
      {user?.role === "CLINIC" &&
        <nav className="flex items-center gap-2">
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            href="/patient/home"
          >
            Adicionar Médicos
          </Link>
          <LinkDropdown title="Registrar" urls={registerUrls} />
          <Link className="btn-primary px-3 py-2" href="/login">
            Login
          </Link>
        </nav>
      }
      </div>
    </header>
  );
}
