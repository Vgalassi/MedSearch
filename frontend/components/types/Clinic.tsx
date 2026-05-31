export type Clinic = {
    id: string,
    name: string,
    phone: string,
    cep: string,
    description: string,
    street: string,
    city: string,
    state: string,
    number?: string,
    latitude?: number,
    longitude?: number,
    distanceInKm?: number
}
