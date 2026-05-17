import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DoctorController } from "../controllers/DoctorController";
import { container } from "../di/container";
import { TYPES } from "../../app/dto/types";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";
import { GetDoctorAvailableDaysUseCase } from "../../app/usecases/getDoctorAvailableDaysUsecase";
import { GetDoctorAvailableHoursUseCase } from "../../app/usecases/GetAvailableHoursUseCase";
import { GetDoctorSchedulingUseCase } from "../../app/usecases/GetDoctorSchedulingUseCase";
import { UpdateDoctorSchedulingUseCase } from "../../app/usecases/UpdateDoctorSchedulingUseCase";

const getAllDoctorsUseCase = container.get<GetAllDoctorsUseCase>(
  TYPES.GetAllDoctorsUseCase,
);
const getDoctorAvailableDaysUseCase =
  container.get<GetDoctorAvailableDaysUseCase>(
    TYPES.GetDoctorAvailableDaysUseCase,
  );

const getDoctorAvailableHoursUseCase =
  container.get<GetDoctorAvailableHoursUseCase>(
    TYPES.GetDoctorAvailableHoursUseCase,
  );
const getDoctorSchedulingUseCase =
  container.get<GetDoctorSchedulingUseCase>(
    TYPES.GetDoctorSchedulingUseCase,
  );
const updateDoctorSchedulingUseCase =
  container.get<UpdateDoctorSchedulingUseCase>(
    TYPES.UpdateDoctorSchedulingUseCase,
  );

const doctorController = new DoctorController(
  getAllDoctorsUseCase,
  getDoctorAvailableDaysUseCase,
  getDoctorAvailableHoursUseCase,
  getDoctorSchedulingUseCase,
  updateDoctorSchedulingUseCase,
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
    app.post(
    "/doctors/days/hours/:id",
    async (req: FastifyRequest, res: FastifyReply) => {
      await doctorController.getAvailableHours(req, res);
    },
  );

  app.put(
    "/doctors/:id/scheduling",
    async (req: FastifyRequest, res: FastifyReply) => {
      await doctorController.updateScheduling(req, res);
    },
  );

  app.get(
    "/doctors/:id/scheduling",
    async (req: FastifyRequest, res: FastifyReply) => {
      await doctorController.getScheduling(req, res);
    },
  );
}
