export class DoctorNotOnClinic extends Error{
    constructor(name: string ){
        super(`Doctor ${name} is not in this clinic`)
        this.name = "DoctorNotOnClinic"
    }
}