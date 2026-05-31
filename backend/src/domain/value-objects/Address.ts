import { Cep } from "./Cep";


export class Address{

    constructor(
        public readonly street: string,
        public readonly city: string,
        public readonly state: string,
        public readonly cep: Cep,
        public readonly number?: string,
        public readonly latitude?: number,
        public readonly longitude?: number
    ){}


    
}






