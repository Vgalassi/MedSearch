import Fastify from "fastify";
import "reflect-metadata";
import userRoutes from './routes/userRoutes.js'
import clinicRoutes from "./routes/clinicRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import cors from '@fastify/cors'
import { ZodError } from "zod";
import { NotfoundError } from "../domain/errors/NotFoundError.js";
import { DoctorAlreadyOnClinic } from "../domain/errors/DoctorAlreadyOnClinic.js";
import { DoctorNotOnClinic } from "../domain/errors/DoctorNotOnClinic.js";
import { AppointmentInPastError } from "../domain/errors/AppointmentInPastError.js";
import { AdvanceBookingViolationError } from "../domain/errors/AdvanceBookingViolationError.js";
import { InvalidAppointmentDurationError } from "../domain/errors/InvalidAppointmentDurationError.js";
import { AppointmentOutsideAvailabilityError } from "../domain/errors/AppointmentOutsideAvailabilityError.js";
import { DoctorSettingsNotFoundError } from "../domain/errors/DoctorSettingsNotFoundError.js";
import { AppointmentSchedulingConflictError } from "../domain/errors/AppointmentSchedulingConflictError.js";
import { DailyAppointmentLimitReachedError } from "../domain/errors/DailyAppointmentLimitReachedError.js";
import { CannotCancelAppointmentError } from "../domain/errors/CannotCancelAppointmentError.js";
import { InvalidAppointmentTimeOrderError } from "../domain/errors/InvalidAppointmentTimeOrderError.js";
const app = Fastify({
    logger: true
})

await app.register(cors, {

  origin: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
})

app.setErrorHandler((error, request, reply) => {
  if (
    error instanceof NotfoundError ||
    error instanceof DoctorAlreadyOnClinic ||
    error instanceof DoctorNotOnClinic ||
    error instanceof AppointmentInPastError ||
    error instanceof AdvanceBookingViolationError ||
    error instanceof InvalidAppointmentDurationError ||
    error instanceof AppointmentOutsideAvailabilityError ||
    error instanceof DoctorSettingsNotFoundError ||
    error instanceof AppointmentSchedulingConflictError ||
    error instanceof DailyAppointmentLimitReachedError ||
    error instanceof CannotCancelAppointmentError ||
    error instanceof InvalidAppointmentTimeOrderError
  ) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.issues,
    });
  }

  console.error(error)
  reply.status(500).send({ message: 'Internal server error' })
})


app.register(userRoutes)
app.register(clinicRoutes)
app.register(doctorRoutes)
app.register(appointmentRoutes)


app.listen({ port:3000}, (err,address) =>{
    if(err){
        app.log.error(err)
        process.exit(1)
    }
})