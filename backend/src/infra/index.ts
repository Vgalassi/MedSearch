import Fastify from "fastify";
import "reflect-metadata";
import userRoutes from './routes/userRoutes.js'
import cors from '@fastify/cors'
const app = Fastify({
    logger: true
})

await app.register(cors, {
  origin: true, // permite qualquer origem
})
app.register(userRoutes)


app.listen({ port:3000}, (err,address) =>{
    if(err){
        app.log.error(err)
        process.exit(1)
    }
})