import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ClinicController } from "../controllers/ClinicController";
import { container } from "../di/container";
import { TYPES } from "../../app/dto/types";
import { AddDoctorToClinicUseCase } from "../../app/usecases/AddDoctorToClinicUseCase";
import { RemoveDoctorFromClinicUseCase } from "../../app/usecases/RemoveDoctorFromClinicUseCase";

const addDoctorToClinicUseCase = container.get<AddDoctorToClinicUseCase>(
  TYPES.AddDoctorToClinicUseCase,
);
const removeDoctorFromClinicUseCase =
  container.get<RemoveDoctorFromClinicUseCase>(
    TYPES.RemoveDoctorFromClinicUseCase,
  );

const clinicController = new ClinicController(
  addDoctorToClinicUseCase,
  removeDoctorFromClinicUseCase,
);

export default async function clinicRoutes(app: FastifyInstance) {
  app.put(
    "/clinic/add-doctor/:id",
    async (req: FastifyRequest, res: FastifyReply) => {
      await clinicController.addDoctor(req, res);
    },
  );

  app.put(
    "/clinic/remove-doctor/:id",
    async (req: FastifyRequest, res: FastifyReply) => {
      await clinicController.removeDoctor(req, res);
    },
  );
}
