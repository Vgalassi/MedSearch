import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DoctorController } from "../controllers/DoctorController";
import { container } from "../di/container";
import { TYPES } from "../../app/dto/types";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";
import { GetDoctorAvailableDaysUseCase } from "../../app/usecases/getDoctorAvailableDaysUsecase";

const getAllDoctorsUseCase = container.get<GetAllDoctorsUseCase>(
  TYPES.GetAllDoctorsUseCase,
);
const getDoctorAvailableDaysUseCase =
  container.get<GetDoctorAvailableDaysUseCase>(
    TYPES.GetDoctorAvailableDaysUseCase,
  );

const doctorController = new DoctorController(
  getAllDoctorsUseCase,
  getDoctorAvailableDaysUseCase,
);

export default async function doctorRoutes(app: FastifyInstance) {
  app.get("/doctors/all", async (req: FastifyRequest, res: FastifyReply) => {
    await doctorController.getAll(req, res);
  });

  app.get(
    "/doctors/days/:id",
    async (req: FastifyRequest, res: FastifyReply) => {
      await doctorController.getAvailableDays(req, res);
    },
  );
}
