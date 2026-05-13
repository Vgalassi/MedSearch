import { InvalidArgumentError } from "../errors/InvalidArgumentError";

export class Email{

    private _email: string
    constructor(email:string){
        this.validate(email)
        this._email = email
    }

    private validate(email:string){
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!regex.test(email)){
            throw new InvalidArgumentError("email")
        }
    }

    public get email(){
        return this._email
    }
}