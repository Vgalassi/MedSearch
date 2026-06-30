import type{ FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { UserController } from '../controllers/UserController' 
import { container } from '../di/container';
import { TYPES } from '../../app/dto/types';
import { CallController } from '../controllers/CallController';
import { JoinCallUseCase } from '../../app/usecases/JoinCallUseCase';

const  joinCallUseCase = container.get<JoinCallUseCase>(
  TYPES.JoinCallUseCase,
);

const callController = new CallController(
  joinCallUseCase
);


export default async function callRoutes(app: FastifyInstance){
 app.get("/appointment/:id/join", async(req:FastifyRequest, res: FastifyReply)=>{
    await callController.join(req,res)

 })


}
