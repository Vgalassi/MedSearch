import { Doctor } from "../Aggregates/Doctor"

export interface DoctorRepository{
    save(doctor: Doctor): Promise<Doctor>
    findById(id: string): Promise<Doctor | null>
    findByClinicId(clinicId: string): Promise<Doctor[]>
    findAll(): Promise<Doctor[]>

    update(doctor: Doctor): Promise<Doctor>
}