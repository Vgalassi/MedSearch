type FormErrorsProps = {
  errors: string[] | null;
};

export function FormErrors({ errors }: FormErrorsProps) {
  if (!errors) return null;

  return (
    <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-4">
      {errors.map((error, index) => (
        <p className="text-sm font-medium text-rose-700" key={index}>
          {error}
        </p>
      ))}
    </div>
  );
}
