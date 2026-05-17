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
import { AddDoctorToClinicUseCase } from "../../app/usecases/AddDoctorToClinicUseCase";
import { RemoveDoctorFromClinicUseCase } from "../../app/usecases/RemoveDoctorFromClinicUseCase";
import { GetClinicDoctorsUseCase } from "../../app/usecases/GetClinicDoctorsUseCase";
import { GetAllClinicsUseCase } from "../../app/usecases/GetAllClinicsUseCase";
import { FindClinicByIdUseCase } from "../../app/usecases/FindClinicByIdUseCase";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";
import { GetDoctorAvailableDaysUseCase } from "../../app/usecases/getDoctorAvailableDaysUsecase";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { PrismaAppointmentRepository } from "../repositories/PrismaAppointmentRepository";
import type { DoctorSettingsRepository } from "../../domain/repositories/DoctorSettingsRepository";
import { PrismaDoctorSettingsRepository } from "../repositories/PrismaDoctorSettingsRepository";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import { PrismaAvailabilityRepository } from "../repositories/PrismaAvailabilityRepository";
import { CreateAppointmentUseCase } from "../../app/usecases/CreateAppointmentUseCase";
import { CancelAppointmentUseCase } from "../../app/usecases/CancelAppointmentUseCase";
import { ListPatientAppointmentsUseCase } from "../../app/usecases/ListPatientAppointmentsUseCase";
import { ListDoctorAppointmentsUseCase } from "../../app/usecases/ListDoctorAppointmentsUseCase";
import { ListDoctorAvailableSlotsUseCase } from "../../app/usecases/ListDoctorAvailableSlotsUseCase";

const container = new Container();

container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container.bind<DoctorRepository>(TYPES.DoctorRepository).to(PrismaDoctorRepository);
container.bind<PatientRepository>(TYPES.PatientRepository).to(PrismaPatientRepository);
container.bind<ClinicRepository>(TYPES.ClinicRepository).to(PrismaClinicRepository);
container.bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase)
container.bind<AddDoctorToClinicUseCase>(TYPES.AddDoctorToClinicUseCase).to(AddDoctorToClinicUseCase)
container.bind<RemoveDoctorFromClinicUseCase>(TYPES.RemoveDoctorFromClinicUseCase).to(RemoveDoctorFromClinicUseCase)
container.bind<GetClinicDoctorsUseCase>(TYPES.GetClinicDoctorsUseCase).to(GetClinicDoctorsUseCase)
container.bind<GetAllClinicsUseCase>(TYPES.GetAllClinicsUseCase).to(GetAllClinicsUseCase)
container.bind<FindClinicByIdUseCase>(TYPES.FindClinicByIdUseCase).to(FindClinicByIdUseCase)
container.bind<GetAllDoctorsUseCase>(TYPES.GetAllDoctorsUseCase).to(GetAllDoctorsUseCase)
container
  .bind<GetDoctorAvailableDaysUseCase>(TYPES.GetDoctorAvailableDaysUseCase)
  .to(GetDoctorAvailableDaysUseCase);
container
  .bind<AppointmentRepository>(TYPES.AppointmentRepository)
  .to(PrismaAppointmentRepository);
container
  .bind<DoctorSettingsRepository>(TYPES.DoctorSettingsRepository)
  .to(PrismaDoctorSettingsRepository);
container
  .bind<AvailabilityRepository>(TYPES.AvailabilityRepository)
  .to(PrismaAvailabilityRepository);
container
  .bind<CreateAppointmentUseCase>(TYPES.CreateAppointmentUseCase)
  .to(CreateAppointmentUseCase);
container
  .bind<CancelAppointmentUseCase>(TYPES.CancelAppointmentUseCase)
  .to(CancelAppointmentUseCase);
container
  .bind<ListPatientAppointmentsUseCase>(TYPES.ListPatientAppointmentsUseCase)
  .to(ListPatientAppointmentsUseCase);
container
  .bind<ListDoctorAppointmentsUseCase>(TYPES.ListDoctorAppointmentsUseCase)
  .to(ListDoctorAppointmentsUseCase);
container
  .bind<ListDoctorAvailableSlotsUseCase>(
    TYPES.ListDoctorAvailableSlotsUseCase,
  )
  .to(ListDoctorAvailableSlotsUseCase);
container.bind<HashGenerator>(TYPES.HashGenerator).to(BcryptAdapter);

export { container };
