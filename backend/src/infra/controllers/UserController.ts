import type {FastifyRequest, FastifyReply} from "fastify";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types.js"
import { RegisterUserUseCase } from "../../app/usecases/RegisterUserUseCase";
import { registerUserSchema,loginSchema } from "../schemas/userSchema.js";
import { LoginUserUseCase } from "../../app/usecases/LoginUserUseCase.js";

@injectable()
export class UserController{
    constructor(
        @inject(TYPES.RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
        @inject(TYPES.LoginUserUseCase) private readonly loginUserUseCase: LoginUserUseCase,
    ){}
    async register(req: FastifyRequest, res: FastifyReply){
       const body = registerUserSchema.parse(req.body);
       const createdUser = await this.registerUserUseCase.execute(body);

       return res.status(201).send({
        id: createdUser.id.value,
        email: createdUser.props.email.email,
        role: createdUser.props.role,
       });
    }

    async login(req:FastifyRequest, res: FastifyReply ){
        const body = loginSchema.parse(req.body)
        const user = await this.loginUserUseCase.execute({email: body.email, password: body.password})
        req.session.userId = user.id.value;
        req.session.role = user.props.role;
        req.session.email = user.props.email.email
        return res.status(200).send({
            success: true
        })
    }
}
