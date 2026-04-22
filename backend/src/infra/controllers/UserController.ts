import type {FastifyRequest, FastifyReply} from "fastify";
import { z }from "zod"
import { CreateUserUseCase } from "../../app/usecases/createUserUseCase";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types"
import type { DeleteUserUseCase } from "../../app/usecases/deleteUserUseCase";

const baseSchema = z.object({
    name: z.string().min(3),
    email: z.string().min(3),
    password: z.string().min(6),
    phone: z.string().min(3),
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
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
        @inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase
    ){}
    async createUser(req: FastifyRequest, res: FastifyReply){
        const data = userSchema.parse(req.body)

        try{
            await this.createUserUseCase.execute(data) 
            res.status(201).send({
                message: "User created"
            })
        }catch(err: any){
            res.status(400).send({
                message: "Error"
            })
        }
     }

    async deleteUser(req: FastifyRequest, res: FastifyReply){
        const paramsSchema = z.object({
            id: z.string()
        })
        const { id } = paramsSchema.parse(req.params)
        try{
             await this.deleteUserUseCase.execute(id)
             return res.status(204).send()
        }catch(err: any){
            throw err;
        }
    }
    }

   
