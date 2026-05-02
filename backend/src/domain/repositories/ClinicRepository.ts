import { Clinic } from "../Aggregates/Clinic"

export interface ClinicRepository{
    save(clinic: Clinic): Promise<Clinic>
    findById(id: string): Promise<Clinic | null>
    findAll(): Promise<Clinic[]>
}