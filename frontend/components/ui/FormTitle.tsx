type FormTitleProps = {
  kicker: string;
  title: string;
};

export function FormTitle({ kicker, title }: FormTitleProps) {
  return (
    <div>
      <p className="section-kicker">{kicker}</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
    </div>
  );
}
