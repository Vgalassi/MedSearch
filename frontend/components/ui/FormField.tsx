type FormFieldProps = {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
};

export function FormField({
  id,
  label,
  name,
  defaultValue,
  type = "text",
}: FormFieldProps) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        className="input"
        defaultValue={defaultValue}
        id={id}
        name={name}
        type={type}
      />
    </div>
  );
}
