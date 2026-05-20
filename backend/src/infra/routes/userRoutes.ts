import type{ FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { UserController } from '../controllers/UserController' 
import { container } from '../di/container';
import { TYPES } from '../../app/dto/types';
import { RegisterUserUseCase } from '../../app/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../app/usecases/LoginUserUseCase';


const registerUserUseCase = container.get<RegisterUserUseCase>(TYPES.RegisterUserUseCase);
const loginUserUseCase = container.get<LoginUserUseCase>(TYPES.LoginUserUseCase);
const userController = new UserController(registerUserUseCase,loginUserUseCase)
export default async function userRoutes(app: FastifyInstance){
 app.post('/users/register', async (req: FastifyRequest, res: FastifyReply) => {
   await userController.register(req,res)
 })

 app.post("/users/login", async(req:FastifyRequest, res: FastifyReply)=>{
  await userController.login(req,res)
 })
  app.get("/me",
  async(req,reply)=>{

    if(!req.session.userId){

        return reply
        .status(401)
        .send();
    }

    return {
        id:req.session.userId,
        role:req.session.role,
        email: req.session.email
    };

  });
}