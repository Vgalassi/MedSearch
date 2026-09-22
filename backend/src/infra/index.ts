import Fastify from "fastify";
import "reflect-metadata";
import userRoutes from './routes/userRoutes.js'
import clinicRoutes from "./routes/clinicRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { createDueAppointmentReminders } from "./notifications/AppointmentReminderService.js";
import cors from '@fastify/cors'
import { setupErrorHandler } from "./error/errorHandler.js";
import { createWebSocketAuthenticator, setupSession } from "./auth/sessionConfig.js";
import { container } from "./di/container.js";
import { TYPES } from "../app/dto/types.js";
import type { JoinCallUseCase } from "../app/usecases/JoinCallUseCase.js";
import { RoomManager } from "./websocket/RoomManager.js";
import { CallWebSocketServer } from "./websocket/CallWebsocketServer.js";
import { AppointmentService } from "../app/services/AppointmentService.js";

import type { SymptomClassifier } from "../app/protocols/SymptomClassifier.js";

const app = Fastify({
    logger: true,
})

/*
await app.register(cors, {
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
*/
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

setupErrorHandler(app)
await setupSession(app)

app.register(userRoutes)
app.register(clinicRoutes)
app.register(doctorRoutes)
app.register(appointmentRoutes)
app.register(callRoutes)
app.register(aiRoutes)
app.register(notificationRoutes)

const appointmentService = container.get<AppointmentService>(
    TYPES.AppointmentService
)
const symptomClassifier = container.get<SymptomClassifier>(
    TYPES.SymptomClassifier
)

app.addHook("onClose", async () => {
    symptomClassifier.shutdown?.()
})

setInterval(() => void appointmentService.updateAppointmentStatuses().catch((error) => app.log.error(error, "Erro ao criar lembretes de consulta")), 60_000);


new CallWebSocketServer(
    app.server,
    new RoomManager(),
    container.get<JoinCallUseCase>(TYPES.JoinCallUseCase),
    { authenticate: createWebSocketAuthenticator(app) },
);


app.listen({ port: 3000 }, (err,address) =>{
    if(err){
        app.log.error(err)
        process.exit(1)
    }
})
