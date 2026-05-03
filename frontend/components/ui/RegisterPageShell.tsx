import { ReactNode } from "react";
import { RegisterIntro } from "./RegisterIntro";

type RegisterPageShellProps = {
  introTitle: string;
  introText: string;
  children: ReactNode;
};

export function RegisterPageShell({
  introTitle,
  introText,
  children,
}: RegisterPageShellProps) {
  return (
    <main className="page-shell">
      <div className="content-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <RegisterIntro title={introTitle} text={introText} />
        <section className="surface p-6 sm:p-8">{children}</section>
      </div>
    </main>
  );
}
