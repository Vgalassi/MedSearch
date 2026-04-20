import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../../app/dto/types";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { CreateUserUseCase } from "../../app/usecases/createUserUseCase";


const container = new Container();

container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container.bind<CreateUserUseCase> (TYPES.CreateUserUseCase).to(CreateUserUseCase)


export { container };