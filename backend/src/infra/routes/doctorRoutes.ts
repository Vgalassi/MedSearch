import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DoctorController } from "../controllers/DoctorController";
import { container } from "../di/container";
import { TYPES } from "../../app/dto/types";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";

const getAllDoctorsUseCase = container.get<GetAllDoctorsUseCase>(
  TYPES.GetAllDoctorsUseCase,
);

const doctorController = new DoctorController(getAllDoctorsUseCase);

export default async function doctorRoutes(app: FastifyInstance) {
  app.get("/doctors/all", async (req: FastifyRequest, res: FastifyReply) => {
    await doctorController.getAll(req, res);
  });
}
