import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";

type UserProps = {
    email: string,
    password: string,
    role: "DOCTOR" | "PATIENT" | "CLINIC"
}



export class User extends AgregateRoot<UserProps>{
    constructor(public props: UserProps,id: Identifier){
        super(props,id)
    }
}