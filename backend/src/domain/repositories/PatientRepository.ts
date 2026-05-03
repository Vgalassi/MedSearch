import { Patient } from "../Aggregates/Patient"

export interface PatientRepository{
    save(patient: Patient): Promise<Patient>
    findById(id: string): Promise<Patient | null>
}