import { Patient } from "../Aggregates/Patient"

export interface PatientRepository{
    save(patient: Patient): Promise<Patient>
}