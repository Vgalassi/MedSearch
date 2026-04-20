import type {FastifyRequest, FastifyReply} from "fastify";
import { z }from "zod"
import { CreateUserUseCase } from "../../app/usecases/createUserUseCase";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types"
@injectable()
export class UserController{
    constructor(
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase
    ){}
    async createUser(req: FastifyRequest, res: FastifyReply){

        const userSchema = z.object({
            name: z.string(),
            email: z.string(),
            password: z.string().min(6),
            role: z.enum(['PATIENT','MEDIC','CLINIC'])
        })
        const data = userSchema.parse(req.body)

        try{
            await this.createUserUseCase.execute(data) 
        }catch(err: any){
            throw err;
        }
     }
        
    }
