import { Doctor } from "../Aggregates/Doctor"

export interface DoctorRepository{
    save(doctor: Doctor): Promise<Doctor>
}