export interface UserProps{
    id?: number,
    name: string,
    email: string,
    password: string,
    role: 'PATIENT' | 'MEDIC' | 'CLINIC'

}

export class User {
    constructor(public props: UserProps){}
}