import type { FastifyRequest, FastifyReply } from "fastify";
import { injectable, inject } from "inversify";
import { TYPES } from "../../app/dto/types.js"
import { prisma } from "../../lib/prisma.js";
import { Auth } from "../auth/authDecorator.js";
import { appointmentIdParamsSchema } from "../schemas/appointmentSchemas.js";
import type { JoinCallUseCase } from "../../app/usecases/JoinCallUseCase.js";

@injectable()
export class CallController {
    constructor(
        @inject(TYPES.JoinCallUseCase) private readonly joinCallUseCase: JoinCallUseCase,
    ) { }

    @Auth("DOCTOR", "PATIENT")
    async join(req: FastifyRequest, res: FastifyReply) {
        const params = appointmentIdParamsSchema.parse(req.params);

        if(!req.session.profileId || !req.session.role){
            return res.status(401).send();
        }

        const createdUser = await this.joinCallUseCase.execute(
            {
                appointmentId: params.id,
                profileId: req.session.profileId,
                role: req.session.role
            }
        );

        return res.status(201).send({});
    }
}