import { Clinic } from "../entities/Clinic"

export interface ClinicRepository{
    getClinics():Clinic[]
}