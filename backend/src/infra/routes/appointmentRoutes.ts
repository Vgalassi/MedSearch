import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppointmentController } from "../controllers/AppointmentController";
import { container } from "../di/container";
import { TYPES } from "../../app/dto/types";
import { CreateAppointmentUseCase } from "../../app/usecases/CreateAppointmentUseCase";
import { CancelAppointmentUseCase } from "../../app/usecases/CancelAppointmentUseCase";
import { ListPatientAppointmentsUseCase } from "../../app/usecases/ListPatientAppointmentsUseCase";
import { ListDoctorAppointmentsUseCase } from "../../app/usecases/ListDoctorAppointmentsUseCase";
import { ListDoctorAvailableSlotsUseCase } from "../../app/usecases/ListDoctorAvailableSlotsUseCase";

const createAppointmentUseCase = container.get<CreateAppointmentUseCase>(
  TYPES.CreateAppointmentUseCase,
);
const cancelAppointmentUseCase = container.get<CancelAppointmentUseCase>(
  TYPES.CancelAppointmentUseCase,
);
const listPatientAppointmentsUseCase =
  container.get<ListPatientAppointmentsUseCase>(
    TYPES.ListPatientAppointmentsUseCase,
  );
const listDoctorAppointmentsUseCase =
  container.get<ListDoctorAppointmentsUseCase>(
    TYPES.ListDoctorAppointmentsUseCase,
  );
const listDoctorAvailableSlotsUseCase =
  container.get<ListDoctorAvailableSlotsUseCase>(
    TYPES.ListDoctorAvailableSlotsUseCase,
  );

const appointmentController = new AppointmentController(
  createAppointmentUseCase,
  cancelAppointmentUseCase,
  listPatientAppointmentsUseCase,
  listDoctorAppointmentsUseCase,
  listDoctorAvailableSlotsUseCase,
);

export default async function appointmentRoutes(app: FastifyInstance) {
  app.post("/appointments", async (req: FastifyRequest, res: FastifyReply) => {
    await appointmentController.create(req, res);
  });

  app.patch(
    "/appointments/:id/cancel",
    async (req: FastifyRequest, res: FastifyReply) => {
      await appointmentController.cancel(req, res);
    },
  );

  app.get(
    "/appointments/patient/:patientId",
    async (req: FastifyRequest, res: FastifyReply) => {
      await appointmentController.listByPatient(req, res);
    },
  );

  app.get(
    "/appointments/patient/:patientId/details",
    async (req: FastifyRequest, res: FastifyReply) => {
      await appointmentController.listDetailedByPatient(req, res);
    },
  );

  app.get(
    "/appointments/doctor/:doctorId",
    async (req: FastifyRequest, res: FastifyReply) => {
      await appointmentController.listByDoctor(req, res);
    },
  );

  app.get(
    "/appointments/doctor/:doctorId/details",
    async (req: FastifyRequest, res: FastifyReply) => {
      await appointmentController.listDetailedByDoctor(req, res);
    },
  );

  app.get(
    "/appointments/doctor/:doctorId/available-slots",
    async (req: FastifyRequest, res: FastifyReply) => {
      await appointmentController.listAvailableSlots(req, res);
    },
  );
}
