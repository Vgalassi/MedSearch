
type ClinicData = {
    cep: string,
    description: string,
    address: string,
    latitude: number,
    longitude: number
}

export type ClinicShowData = {
    id: string
    name: string,
    email: string,
    phone: string,
    role: "CLINIC"
    roleData: ClinicData
} 
