import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { AddDoctorToClinicUseCase } from "../../app/usecases/AddDoctorToClinicUseCase";
import { RemoveDoctorFromClinicUseCase } from "../../app/usecases/RemoveDoctorFromClinicUseCase";
import { GetClinicDoctorsUseCase } from "../../app/usecases/GetClinicDoctorsUseCase";
import { GetAllClinicsUseCase } from "../../app/usecases/GetAllClinicsUseCase";
import {
  clinicDoctorBodySchema,
  clinicDoctorParamsSchema,
  listClinicsQuerySchema,
} from "../schemas/clinicDoctorSchema";
import type { FindClinicByIdUseCase } from "../../app/usecases/FindClinicByIdUseCase";
import { Auth } from "../auth/authDecorator";
import type { Clinic } from "../../domain/Aggregates/Clinic";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "node:crypto";

function serializeClinic(clinic: Clinic, distanceInKm?: number) {
  return {
    id: clinic.id.value,
    userId: clinic.props.userId.value,
    name: clinic.props.name,
    phone: clinic.props.phone.value,
    street: clinic.props.address.street,
    city: clinic.props.address.city,
    state: clinic.props.address.state,
    number: clinic.props.address.number,
    cep: clinic.props.address.cep.value,
    latitude: clinic.props.address.latitude,
    longitude: clinic.props.address.longitude,
    description: clinic.props.description,
    distanceInKm,
  };
}

@injectable()
export class ClinicController {
  constructor(
    @inject(TYPES.AddDoctorToClinicUseCase)
    private readonly addDoctorToClinicUseCase: AddDoctorToClinicUseCase,
    @inject(TYPES.RemoveDoctorFromClinicUseCase)
    private readonly removeDoctorFromClinicUseCase: RemoveDoctorFromClinicUseCase,
    @inject(TYPES.GetClinicDoctorsUseCase)
    private readonly getClinicDoctorsUseCase: GetClinicDoctorsUseCase,
    @inject(TYPES.GetAllClinicsUseCase)
    private readonly getAllClinicsUseCase: GetAllClinicsUseCase,
    @inject(TYPES.FindClinicByIdUseCase)
    private readonly findClinicsByIdUseCase: FindClinicByIdUseCase
  ) {}

  @Auth("CLINIC")
  async addDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = clinicDoctorParamsSchema.parse(req.params);
    const body = clinicDoctorBodySchema.parse(req.body);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de clinica invalida" });
    }

    if (req.session.profileId !== params.id) {
      return res.status(403).send({ message: "Voce nao pode alterar outra clinica" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: body.doctorId } });
    if (!doctor) return res.status(404).send({ message: "Medico nao encontrado" });
    if (doctor.clinicId) return res.status(409).send({ message: "Medico ja esta vinculado a uma clinica" });

    const existing = await prisma.clinicInvitation.findFirst({
      where: { clinicId: params.id, doctorId: body.doctorId, status: "PENDING" },
    });
    if (existing) return res.status(409).send({ message: "Ja existe uma solicitacao pendente para este medico" });

    const invitation = await prisma.clinicInvitation.create({
      data: { id: randomUUID(), clinicId: params.id, doctorId: body.doctorId },
      include: { clinic: true },
    });
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: doctor.userId,
        type: "CLINIC_INVITATION",
        title: "Convite para clinica",
        message: `A clinica ${invitation.clinic.name} solicitou sua inclusao na equipe.`,
        data: { invitationId: invitation.id, clinicId: invitation.clinicId },
      },
    });

    return res.status(201).send({
      message: "Solicitacao enviada ao medico",
      invitationId: invitation.id,
      doctorId: doctor.id,
      clinicId: invitation.clinicId,
    });
  }

  @Auth("CLINIC")
  async removeDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = clinicDoctorParamsSchema.parse(req.params);
    const body = clinicDoctorBodySchema.parse(req.body);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de clinica invalida" });
    }

    if (req.session.profileId !== params.id) {
      return res.status(403).send({ message: "Voce nao pode alterar outra clinica" });
    }

    const doctor = await this.removeDoctorFromClinicUseCase.execute({
      clinicId: params.id,
      doctorId: body.doctorId,
    });

    return res.status(200).send({
      message: "Doctor removed from clinic",
      doctorId: doctor.id.value,
      clinicId: doctor.props.clinicId?.value ?? null,
    });
  }

  async getClinicDoctors(req: FastifyRequest, res: FastifyReply) {
    const params = clinicDoctorParamsSchema.parse(req.params);
    const doctors = await this.getClinicDoctorsUseCase.execute(params.id);

    return res.status(200).send({
      clinicId: params.id,
      doctors: doctors.map((doctor) => ({
        id: doctor.id.value,
        userId: doctor.props.userId.value,
        name: doctor.props.name,
        phone: doctor.props.phone.value,
        crm: doctor.props.crm,
        speciality: doctor.props.speciality,
        clinicId: doctor.props.clinicId?.value ?? null,
      })),
    });
  }

  async getAllClinics(req: FastifyRequest, res: FastifyReply) {
    const clinics = await this.getAllClinicsUseCase.execute();

    return res.status(200).send({
      clinics: clinics.map((clinic) => serializeClinic(clinic)),
    });
  }

  async listClinics(req: FastifyRequest, res: FastifyReply) {
    const query = listClinicsQuerySchema.parse(req.query);
    const clinics = await this.getAllClinicsUseCase.execute({
      page: query.page,
      pageSize: query.pageSize,
      ...(query.search ? { search: query.search } : {}),
      ...(typeof query.latitude === "number" ? { latitude: query.latitude } : {}),
      ...(typeof query.longitude === "number" ? { longitude: query.longitude } : {}),
    });

    return res.status(200).send({
      clinics: clinics.items.map((item) =>
        serializeClinic(item.clinic, item.distanceInKm),
      ),
      pagination: {
        total: clinics.total,
        page: clinics.page,
        pageSize: clinics.pageSize,
        totalPages: clinics.totalPages,
      },
    });
  }

  async findClinicById(req: FastifyRequest, res: FastifyReply){
    const params =  clinicDoctorParamsSchema.parse(req.params);
    const clinic = await this.findClinicsByIdUseCase.execute(params.id);

    return res.status(200).send(serializeClinic(clinic))
  }
}
