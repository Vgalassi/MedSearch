import type{ FastifyInstance } from 'fastify'
import { UserController } from '../controllers/UserController' 
import { container } from '../di/container';
import { TYPES } from '../../app/dto/types';
import { CreateUserUseCase } from '../../app/usecases/createUserUseCase';
import type { DeleteUserUseCase } from '../../app/usecases/deleteUserUseCase';


const createUserUseCase = container.get<CreateUserUseCase>(TYPES.CreateUserUseCase);
const deleteUserUseCase = container.get<DeleteUserUseCase>(TYPES.DeleteUserUseCase);

const userController = new UserController(createUserUseCase,deleteUserUseCase)
export default async function userRoutes(app: FastifyInstance){
 app.get('/users', async (req,res) => {
    return { test: 'test'}
 })

 app.post('/create', async (req,res) => {
   await userController.createUser(req,res)
 })

 app.delete('/users/delete/:id', async(req,res) => {
    await userController.deleteUser(req,res)
 })

 
}