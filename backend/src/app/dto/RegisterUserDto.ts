
export type RegisterUserDto = {
  email: string;
  password: string;
  role: "DOCTOR" | "PATIENT" | "CLINIC";
  name: string;
  phone: string;
  crm?: string | undefined;
  speciality?: string | undefined;
  cpf?: string | undefined;
  address?: string | undefined;
  cep?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  description?: string | undefined;
  clinicId?: string | undefined;
};