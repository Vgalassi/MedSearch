import type {FastifyRequest, FastifyReply} from "fastify";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types.js"
import { RegisterUserUseCase } from "../../app/usecases/RegisterUserUseCase";
import { registerUserSchema } from "../schemas/registerUserSchema";

@injectable()
export class UserController{
    constructor(
        @inject(TYPES.RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    ){}
    async register(req: FastifyRequest, res: FastifyReply){
       const body = registerUserSchema.parse(req.body);
       const createdUser = await this.registerUserUseCase.execute(body);

       return res.status(201).send({
        id: createdUser.id.value,
        email: createdUser.props.email,
        role: createdUser.props.role,
       });
    }
}
