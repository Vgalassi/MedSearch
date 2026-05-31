import type {FastifyRequest, FastifyReply} from "fastify";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types.js"
import { RegisterUserUseCase } from "../../app/usecases/RegisterUserUseCase";
import { registerUserSchema,loginSchema } from "../schemas/userSchema.js";
import { LoginUserUseCase } from "../../app/usecases/LoginUserUseCase.js";
import { prisma } from "../../lib/prisma.js";

async function findProfileId(userId: string, role: "DOCTOR" | "PATIENT" | "CLINIC") {
    if (role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId },
            select: { id: true },
        });

        return patient?.id ?? null;
    }

    if (role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
            where: { userId },
            select: { id: true },
        });

        return doctor?.id ?? null;
    }

    const clinic = await prisma.clinic.findUnique({
        where: { userId },
        select: { id: true },
    });

    return clinic?.id ?? null;
}

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
        const profileId = await findProfileId(user.id.value, user.props.role);

        req.session.userId = user.id.value;
        req.session.role = user.props.role;
        req.session.email = user.props.email.email;
        if (profileId) {
            req.session.profileId = profileId;
        } else {
            delete req.session.profileId;
        }

        return res.status(200).send({
            success: true,
            user: {
                id: user.id.value,
                email: user.props.email.email,
                role: user.props.role,
                profileId,
            }
        })
    }

    async me(req: FastifyRequest, res: FastifyReply) {
        if (!req.session.userId || !req.session.role || !req.session.email) {
            return res.status(401).send();
        }

        const profileId =
            req.session.profileId ??
            (await findProfileId(req.session.userId, req.session.role));

        if (profileId) {
            req.session.profileId = profileId;
        } else {
            delete req.session.profileId;
        }

        return res.status(200).send({
            id: req.session.userId,
            role: req.session.role,
            email: req.session.email,
            profileId,
        });
    }

    async logout(req:FastifyRequest, res: FastifyReply ){
        await req.session.destroy();

        return res.status(200).send({
            success: true
        })
    }
}
