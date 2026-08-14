export const SPECIALITIES = [
  { value: "CARDIOLOGIA", label: "Cardiologia" },
  { value: "DERMATOLOGIA", label: "Dermatologia" },
  { value: "PEDIATRIA", label: "Pediatria" },
  { value: "ORTOPEDIA", label: "Ortopedia" },
  { value: "NEUROLOGIA", label: "Neurologia" },
  { value: "GINECOLOGIA", label: "Ginecologia" },
  { value: "PSIQUIATRIA", label: "Psiquiatria" },
  { value: "GASTROENTEROLOGIA", label: "Gastroenterologia" },
  { value: "CLINICO_GERAL", label: "Clínico Geral" },
] as const;

export type SpecialityValue = (typeof SPECIALITIES)[number]["value"];

export function specialityLabel(value: string) {
  const match = SPECIALITIES.find(
    (item) => item.value === value || item.label.toLowerCase() === value.toLowerCase(),
  );
  return match?.label ?? value;
}
