type FormTextareaProps = {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  minHeightClassName?: string;
};

export function FormTextarea({
  id,
  label,
  name,
  defaultValue,
  minHeightClassName = "min-h-24",
}: FormTextareaProps) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <textarea
        className={`input ${minHeightClassName}`}
        defaultValue={defaultValue}
        id={id}
        name={name}
      />
    </div>
  );
}
