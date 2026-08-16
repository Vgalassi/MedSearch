import type {FastifyRequest, FastifyReply} from "fastify";
import { injectable,inject } from "inversify";
import { TYPES } from "../../app/dto/types.js"
import { RegisterUserUseCase } from "../../app/usecases/RegisterUserUseCase";
import {
    registerUserSchema,
    loginSchema,
    updateClinicProfileSchema,
    updateDoctorProfileSchema,
    updatePatientProfileSchema,
} from "../schemas/userSchema.js";
import { LoginUserUseCase } from "../../app/usecases/LoginUserUseCase.js";
import { prisma } from "../../lib/prisma.js";
import type { CepService } from "../../app/protocols/CepService.js";
import type { GeocodingService } from "../../app/protocols/GeocodingService.js";

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
        @inject(TYPES.CepService) private readonly cepService: CepService,
        @inject(TYPES.GeocodingService) private readonly geocodingService: GeocodingService,
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

    async profile(req: FastifyRequest, res: FastifyReply) {
        if (!req.session.userId || !req.session.role) {
            return res.status(401).send({ message: "Autenticação necessária" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.session.userId },
            select: {
                email: true,
                role: true,
                patient: { select: { name: true, phone: true, cpf: true } },
                doctor: { select: { name: true, phone: true, crm: true, speciality: true } },
                clinic: {
                    select: {
                        name: true, phone: true, cep: true, number: true,
                        street: true, city: true, state: true, description: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }

        const details = user.patient ?? user.doctor ?? user.clinic;
        return res.status(200).send({ email: user.email, role: user.role, ...details });
    }

    async updateProfile(req: FastifyRequest, res: FastifyReply) {
        if (!req.session.userId || !req.session.role) {
            return res.status(401).send({ message: "Autenticação necessária" });
        }

        if (req.session.role === "PATIENT") {
            const data = updatePatientProfileSchema.parse(req.body);
            await prisma.patient.update({ where: { userId: req.session.userId }, data });
        } else if (req.session.role === "DOCTOR") {
            const data = updateDoctorProfileSchema.parse(req.body);
            await prisma.doctor.update({ where: { userId: req.session.userId }, data });
        } else {
            const data = updateClinicProfileSchema.parse(req.body);
            const current = await prisma.clinic.findUniqueOrThrow({
                where: { userId: req.session.userId },
                select: { cep: true, number: true },
            });

            let addressData = {};
            if (data.cep !== current.cep || data.number !== current.number) {
                let address = await this.cepService.findAddress(data.cep, data.number);
                address = await this.geocodingService.getCoordinates(address);
                addressData = {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    latitude: address.latitude,
                    longitude: address.longitude,
                };
            }

            await prisma.clinic.update({
                where: { userId: req.session.userId },
                data: { ...data, ...addressData },
            });
        }

        return res.status(200).send({ success: true, message: "Dados atualizados com sucesso" });
    }

    async logout(req:FastifyRequest, res: FastifyReply ){
        await req.session.destroy();

        return res.status(200).send({
            success: true
        })
    }
}
