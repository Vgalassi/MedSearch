import type{ FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { UserController } from '../controllers/UserController' 
import { container } from '../di/container';
import { TYPES } from '../../app/dto/types';
import { RegisterUserUseCase } from '../../app/usecases/RegisterUserUseCase';


const registerUserUseCase = container.get<RegisterUserUseCase>(TYPES.RegisterUserUseCase);

const userController = new UserController(registerUserUseCase)
export default async function userRoutes(app: FastifyInstance){
 app.post('/users/register', async (req: FastifyRequest, res: FastifyReply) => {
   await userController.register(req,res)
 })
}