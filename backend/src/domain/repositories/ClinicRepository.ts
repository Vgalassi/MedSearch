import { Clinic } from "../Aggregates/Clinic"

export type ClinicListParams = {
    page: number;
    pageSize: number;
    search?: string;
    latitude?: number;
    longitude?: number;
}

export type ClinicListItem = {
    clinic: Clinic;
    distanceInKm?: number;
}

export type PaginatedClinics = {
    items: ClinicListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ClinicRepository{
    save(clinic: Clinic): Promise<Clinic>
    findById(id: string): Promise<Clinic | null>
    findAll(): Promise<Clinic[]>
    findMany(params: ClinicListParams): Promise<PaginatedClinics>
}
