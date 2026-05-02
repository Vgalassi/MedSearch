export class DoctorAlreadyOnClinic extends Error{
    constructor(name: string ){
        super(`Doctor ${name} is already on a clinic`)
        this.name = "DoctorAlreadyOnClinic"
    }
}