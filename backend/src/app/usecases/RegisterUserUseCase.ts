import type { User } from "../../domain/Aggregates/User";
import type { UseCase } from "../../domain/value-objects/UseCase";
import type { RegisterUserDto } from "../dto/RegisterUserDto";
import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import type { HashGenerator } from "../protocols/HashGenerator";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import { Identifier } from "../../domain/value-objects/Identifier";
import { User as UserAggregate } from "../../domain/Aggregates/User";
import { Doctor } from "../../domain/Aggregates/Doctor";
import { Patient } from "../../domain/Aggregates/Patient";
import { Clinic } from "../../domain/Aggregates/Clinic";
import { Email } from "../../domain/value-objects/Email";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber";
import { CPF } from "../../domain/value-objects/Cpf";

@injectable()
export class RegisterUserUseCase implements UseCase<RegisterUserDto,Promise<User>>{
    constructor(
        @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
        @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
        @inject(TYPES.PatientRepository) private readonly patientRepository: PatientRepository,
        @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
        @inject(TYPES.HashGenerator) private readonly hashGenerator: HashGenerator,
    ){}

    async execute(input: RegisterUserDto): Promise<User> {
        const email = new Email(input.email);
        const phone = new PhoneNumber(input.phone);

        const userAlreadyExists = await this.userRepository.findByEmail(email);
        if (userAlreadyExists) {
            throw new Error("User already exists");
        }

        const passwordHash = await this.hashGenerator.hash(input.password);
        const user = new UserAggregate(
            {
                email,
                password: passwordHash,
                role: input.role,
            },
            new Identifier(),
        );

        const createdUser = await this.userRepository.save(user);

        if (input.role === "DOCTOR") {
            if (!input.crm || !input.speciality) {
                throw new Error("Doctor data is required");
            }

            const doctor = Doctor.create(
                {
                    userId: createdUser.id,
                    name: input.name,
                    phone,
                    crm: input.crm,
                    speciality: input.speciality,
                    ...(input.clinicId ? { clinicId: new Identifier(input.clinicId) } : {}),
                },
                new Identifier(),
            );

            await this.doctorRepository.save(doctor);
            return createdUser;
        }

        if (input.role === "PATIENT") {
            if (!input.cpf) {
                throw new Error("Patient data is required");
            }

            const patient = new Patient(
                {
                    userId: createdUser.id,
                    name: input.name,
                    phone,
                    cpf: new CPF(input.cpf),
                },
                new Identifier(),
            );

            await this.patientRepository.save(patient);
            return createdUser;
        }

        if (!input.address || !input.cep || input.latitude === undefined || input.longitude === undefined || !input.description) {
            throw new Error("Clinic data is required");
        }

        const clinic = new Clinic(
            {
                userId: createdUser.id,
                name: input.name,
                phone,
                address: input.address,
                cep: input.cep,
                latitude: input.latitude,
                longitude: input.longitude,
                description: input.description,
            },
            new Identifier(),
        );

        await this.clinicRepository.save(clinic);
        return createdUser;
    }
}
