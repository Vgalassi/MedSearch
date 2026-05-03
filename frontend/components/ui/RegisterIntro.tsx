type RegisterIntroProps = {
  title: string;
  text: string;
};

export function RegisterIntro({ title, text }: RegisterIntroProps) {
  return (
    <section className="rounded-lg bg-teal-950 p-8 text-white shadow-lg shadow-slate-200/70">
      <p className="section-kicker text-teal-200">MedSearch</p>
      <h1 className="mt-4 text-4xl font-bold leading-tight">{title}</h1>
      <p className="mt-5 leading-8 text-teal-50/80">{text}</p>
    </section>
  );
}
