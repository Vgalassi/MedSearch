import type {FastifyRequest, FastifyReply} from "fastify";
import { z }from "zod"
import { CreateUserUseCase } from "../../app/usecases/createUserUseCase";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types"

const baseSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string().min(6),
    phone: z.string(),
    role: z.enum(['PATIENT','MEDIC','CLINIC']),
    
})


const patientSchema = baseSchema.extend({
    role: z.literal('PATIENT'),
    roleData: z.object({
        cpf: z.string()
    })
})

const medicSchema = baseSchema.extend({
    role: z.literal('MEDIC'),
    roleData: z.object({
        crm: z.string(),
        speciality: z.string()
    })
})

const clinicSchema = baseSchema.extend({
    role: z.literal('CLINIC'),
    roleData: z.object({
        address: z.string(),
        cep: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        description: z.string()
    })
})

const userSchema = z.discriminatedUnion("role", [
    patientSchema,
    medicSchema,
    clinicSchema
])

@injectable()
export class UserController{
    constructor(
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase
    ){}
    async createUser(req: FastifyRequest, res: FastifyReply){
        const data = userSchema.parse(req.body)

        try{
            await this.createUserUseCase.execute(data) 
        }catch(err: any){
            throw err;
        }
     }
        
    }
