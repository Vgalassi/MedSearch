
export type RegisterUserDto = {
  email: string;
  password: string;
  role: "DOCTOR" | "PATIENT" | "CLINIC";
  name: string;
  phone: string;
  crm?: string | undefined;
  speciality?: string | undefined;
  cpf?: string | undefined;
  number?: string;
  cep?: string | undefined;
  description?: string | undefined;
  clinicId?: string | undefined;
};