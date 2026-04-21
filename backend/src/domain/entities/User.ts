type BaseProps = {
    id?: string,
    name: string,
    email: string,
    phone: string,
    password: string,
}

type PatientUserProps = BaseProps & {
    role: 'PATIENT',
    roleData: {
        cpf: string,

    }

}

type ClinicUserProps = BaseProps & {
    role: 'CLINIC'
    roleData: {
        address: string,
        cep: string,
        latitude: number,
        longitude: number
        description: string
    }
}

type MedicUserProps = BaseProps & {
    role: 'MEDIC',
    roleData:{
        crm: string,
        speciality: string
    }
}


export type UserProps = 
    | PatientUserProps
    | ClinicUserProps
    | MedicUserProps
    



export class User {
    constructor(public props: UserProps){}
}