import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../../app/dto/types";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import type{ HashGenerator } from "../../app/protocols/HashGenerator";
import { BcryptAdapter } from "../cryptography/BcryptAdapter";
import { RegisterUserUseCase } from "../../app/usecases/RegisterUserUseCase";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { PrismaDoctorRepository } from "../repositories/PrismaDoctorRepository";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";
import { PrismaPatientRepository } from "../repositories/PrismaPatientRepository";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import { PrismaClinicRepository } from "../repositories/PrismaClinicRepository";

const container = new Container();

container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container.bind<DoctorRepository>(TYPES.DoctorRepository).to(PrismaDoctorRepository);
container.bind<PatientRepository>(TYPES.PatientRepository).to(PrismaPatientRepository);
container.bind<ClinicRepository>(TYPES.ClinicRepository).to(PrismaClinicRepository);
container.bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase)
container.bind<HashGenerator>(TYPES.HashGenerator).to(BcryptAdapter);

export { container };