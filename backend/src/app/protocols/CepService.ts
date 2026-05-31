import { Address } from "../../domain/value-objects/Address";
export interface CepService {
   findAddress(cep: string,number:string): Promise<Address>;

}