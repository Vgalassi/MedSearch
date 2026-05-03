import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ClinicController } from "../controllers/ClinicController";
import { container } from "../di/container";
import { TYPES } from "../../app/dto/types";
import { AddDoctorToClinicUseCase } from "../../app/usecases/AddDoctorToClinicUseCase";
import { RemoveDoctorFromClinicUseCase } from "../../app/usecases/RemoveDoctorFromClinicUseCase";
import { GetClinicDoctorsUseCase } from "../../app/usecases/GetClinicDoctorsUseCase";
import { GetAllClinicsUseCase } from "../../app/usecases/GetAllClinicsUseCase";
import { FindClinicByIdUseCase } from "../../app/usecases/FindClinicByIdUseCase";

const addDoctorToClinicUseCase = container.get<AddDoctorToClinicUseCase>(
  TYPES.AddDoctorToClinicUseCase,
);
const removeDoctorFromClinicUseCase =
  container.get<RemoveDoctorFromClinicUseCase>(
    TYPES.RemoveDoctorFromClinicUseCase,
  );
const getClinicDoctorsUseCase = container.get<GetClinicDoctorsUseCase>(
  TYPES.GetClinicDoctorsUseCase,
);
const getAllClinicsUseCase = container.get<GetAllClinicsUseCase>(
  TYPES.GetAllClinicsUseCase,
);

const findClinicByIdUseCase = container.get<FindClinicByIdUseCase>(
  TYPES.FindClinicByIdUseCase
)

const clinicController = new ClinicController(
  addDoctorToClinicUseCase,
  removeDoctorFromClinicUseCase,
  getClinicDoctorsUseCase,
  getAllClinicsUseCase,
  findClinicByIdUseCase
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

  app.get(
    "/clinics/doctors/:id",
    async (req: FastifyRequest, res: FastifyReply) => {
      await clinicController.getClinicDoctors(req, res);
    },
  );

  app.get("/clinics/all", async (req: FastifyRequest, res: FastifyReply) => {
    await clinicController.getAllClinics(req, res);
  });

  app.get("/clinics/find/:id", async (req: FastifyRequest, res: FastifyReply) => {
    await clinicController.findClinicById(req, res);
  });
  
}