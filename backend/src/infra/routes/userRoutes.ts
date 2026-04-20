import type{ FastifyInstance } from 'fastify'
import { UserController } from '../controllers/UserController' 
import { container } from '../di/container';
import { TYPES } from '../../app/dto/types';
import { CreateUserUseCase } from '../../app/usecases/createUserUseCase';


const createUserUseCase = container.get<CreateUserUseCase>(TYPES.CreateUserUseCase);
const createController = new UserController(createUserUseCase)
export default async function userRoutes(app: FastifyInstance){
 app.get('/users', async (req,res) => {
    return { test: 'test'}
 })

 app.post('/create', async (req,res) => {
   await createController.createUser(req,res)
 })
}