import { ZodError } from "zod";
import { NotfoundError } from "../../domain/errors/NotFoundError.js";
import { DoctorAlreadyOnClinic } from "../../domain/errors/DoctorAlreadyOnClinic.js";
import { DoctorNotOnClinic } from "../../domain/errors/DoctorNotOnClinic.js";
import { AppointmentInPastError } from "../../domain/errors/AppointmentInPastError.js";
import { AdvanceBookingViolationError } from "../../domain/errors/AdvanceBookingViolationError.js";
import { InvalidAppointmentDurationError } from "../../domain/errors/InvalidAppointmentDurationError.js";
import { AppointmentOutsideAvailabilityError } from "../../domain/errors/AppointmentOutsideAvailabilityError.js";
import { DoctorSettingsNotFoundError } from "../../domain/errors/DoctorSettingsNotFoundError.js";
import { AppointmentSchedulingConflictError } from "../../domain/errors/AppointmentSchedulingConflictError.js";
import { DailyAppointmentLimitReachedError } from "../../domain/errors/DailyAppointmentLimitReachedError.js";
import { CannotCancelAppointmentError } from "../../domain/errors/CannotCancelAppointmentError.js";
import { InvalidAppointmentTimeOrderError } from "../../domain/errors/InvalidAppointmentTimeOrderError.js";
import type { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError.js";
import { LowConfidenceClassificationError } from "../../domain/errors/LowConfidenceClassificationError.js";


export function setupErrorHandler(app: FastifyInstance){
    app.setErrorHandler((error: Error, request, reply) => {
        console.log(error)
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

        if (error instanceof LowConfidenceClassificationError) {
            return reply.status(422).send({ message: error.message });
        }

        if (error instanceof ZodError) {
            return reply.status(400).send({
            message: "Validation error",
            issues: error.issues,
            });
        }

        if(error instanceof UnauthorizedError ){
            reply.status(403).send({ message: error.message})
        }

        console.error(error)
        if(error.message != undefined ){
            reply.status(500).send({ message: error.message})
        }
        reply.status(500).send({ message: "Erro no servidor" })
        })
    }
