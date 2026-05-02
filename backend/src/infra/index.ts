import Fastify from "fastify";
import "reflect-metadata";
import userRoutes from './routes/userRoutes.js'
import clinicRoutes from "./routes/clinicRoutes.js";
import cors from '@fastify/cors'
import { ZodError } from "zod";
import { NotfoundError } from "../domain/errors/NotFoundError.js";
import { DoctorAlreadyOnClinic } from "../domain/errors/DoctorAlreadyOnClinic.js";
import { DoctorNotOnClinic } from "../domain/errors/DoctorNotOnClinic.js";
const app = Fastify({
    logger: true
})

await app.register(cors, {
  origin: true, // permite qualquer origem
})

app.setErrorHandler((error, request, reply) => {
  if (
    error instanceof NotfoundError ||
    error instanceof DoctorAlreadyOnClinic ||
    error instanceof DoctorNotOnClinic
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


app.listen({ port:3000}, (err,address) =>{
    if(err){
        app.log.error(err)
        process.exit(1)
    }
})