import Fastify from "fastify";
import "reflect-metadata";
import userRoutes from './routes/userRoutes.js'
import clinicRoutes from "./routes/clinicRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import cors from '@fastify/cors'
import { setupErrorHandler } from "./error/errorHandler.js";
import { setupSession } from "./auth/sessionConfig.js";

const app = Fastify({
    logger: true
})

await app.register(cors, {
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
})

setupErrorHandler(app)
setupSession(app)

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