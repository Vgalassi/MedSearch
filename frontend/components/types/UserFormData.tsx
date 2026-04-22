type ClinicData = {
    cep: string,
    description: string,
    address: string,
    latitude: number,
    longitude: number
}

type PatientData = {
    cpf: string
}

type MedicData = {
    crm: string,
    speciality: string
 
}


export type MedicCreateFormData={
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    role: "MEDIC"
    roleData: MedicData
} 

export type PatientCreateFormData= {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    role: "PATIENT"
    roleData: PatientData
} 
export type ClinicCreateFormData = {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    role: "CLINIC"
    roleData: ClinicData
} 

export type UserCreateFormData =
 ClinicCreateFormData | PatientCreateFormData | MedicCreateFormData
 

