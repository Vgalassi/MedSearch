import { injectable } from "inversify";
import type { CepService } from "../../app/protocols/CepService";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import { Address } from "../../domain/value-objects/Address";
import { Cep } from "../../domain/value-objects/Cep";
@injectable()
export class CepViaService implements CepService {

   async findAddress(cep: string, number:string){

      const response =await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if(!response.ok){
         throw new Error("Erro ao consultar CEP");
      }
      const data = await response.json();

      if(data.erro){
         throw new NotfoundError("cep", cep);
      }

      return new Address(
         data.logradouro,
         data.localidade,
         data.uf,
         new Cep(cep),
         number
      );
   }

}
