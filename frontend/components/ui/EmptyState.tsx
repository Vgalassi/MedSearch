type EmptyStateProps = {
  text: string;
};

export function EmptyState({ text }: EmptyStateProps) {
  return <div className="surface p-8 text-center text-slate-600">{text}</div>;
}
