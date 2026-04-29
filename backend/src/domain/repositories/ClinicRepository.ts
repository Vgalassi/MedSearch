import { Clinic } from "../Aggregates/Clinic"

export interface ClinicRepository{
    save(clinic: Clinic): Promise<Clinic>
}