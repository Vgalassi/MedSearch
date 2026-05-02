

export type MedicCreateFormData={
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    role: "DOCTOR",
    crm: string,
    speciality: string
    
} 

export type PatientCreateFormData= {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    role: "PATIENT"
    cpf: string
} 
export type ClinicCreateFormData = {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    role: "CLINIC"
    cep: string,
    description: string,
    address: string,
    latitude: number,
    longitude: number
} 

export type UserCreateFormData =
 ClinicCreateFormData | PatientCreateFormData | MedicCreateFormData
 

