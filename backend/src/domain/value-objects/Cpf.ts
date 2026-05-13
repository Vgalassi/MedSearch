import { InvalidArgumentError } from "../errors/InvalidArgumentError";



export class CPF{
    private _cpf: string
    
    constructor(cpf: string){
        this.validate(cpf)
        this._cpf = cpf
    }

    get cpf(){
        return this._cpf
    }
    
    validate(cpf:string){
        const cleanCPF = cpf.replace(/\D/g, '');

        if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) {
            throw new InvalidArgumentError("cpf")
        }

        const digits = cleanCPF.split('').map(el => +el);
        
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += digits[i] as number * (10 - i);
        }
        let rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== digits[9]) throw new InvalidArgumentError("cpf");

        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += digits[i] as number * (11 - i);
        }
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== digits[10]){
            throw new InvalidArgumentError("cpf")
        };

        return true;
    }
}