import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../../app/dto/types";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { CreateUserUseCase } from "../../app/usecases/createUserUseCase";
import type{ HashGenerator } from "../../app/protocols/HashGenerator";
import { BcryptAdapter } from "../cryptography/bcryptAdapter";

const container = new Container();

container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container.bind<CreateUserUseCase> (TYPES.CreateUserUseCase).to(CreateUserUseCase)
container.bind<HashGenerator>(TYPES.HashGenerator).to(BcryptAdapter);

export { container };