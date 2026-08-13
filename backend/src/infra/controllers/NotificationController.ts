import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { Auth } from "../auth/authDecorator";

const notificationIdSchema = z.object({ id: z.uuid() });
const invitationIdSchema = z.object({ id: z.uuid() });

function serializeNotification(notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  data: unknown;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export class NotificationController {
  @Auth("PATIENT", "DOCTOR", "CLINIC")
  async list(req: FastifyRequest, res: FastifyReply) {
    if (!req.session.userId) return res.status(401).send({ message: "Sessao invalida" });
    const notifications = await prisma.notification.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.send({ notifications: notifications.map(serializeNotification) });
  }

  @Auth("PATIENT", "DOCTOR", "CLINIC")
  async markRead(req: FastifyRequest, res: FastifyReply) {
    if (!req.session.userId) return res.status(401).send({ message: "Sessao invalida" });
    const { id } = notificationIdSchema.parse(req.params);
    const notification = await prisma.notification.updateMany({
      where: { id, userId: req.session.userId },
      data: { readAt: new Date() },
    });
    if (notification.count === 0) return res.status(404).send({ message: "Notificacao nao encontrada" });
    return res.status(204).send();
  }

  @Auth("DOCTOR")
  async respondToInvitation(req: FastifyRequest, res: FastifyReply) {
    const { id } = invitationIdSchema.parse(req.params);
    const body = z.object({ accept: z.boolean() }).parse(req.body);
    const doctor = await prisma.doctor.findUnique({ where: { id: req.session.profileId ?? "" } });
    if (!doctor) return res.status(401).send({ message: "Sessao de medico invalida" });

    const invitation = await prisma.clinicInvitation.findFirst({
      where: { id, doctorId: doctor.id, status: "PENDING" },
      include: { clinic: true },
    });
    if (!invitation) return res.status(404).send({ message: "Solicitacao pendente nao encontrada" });

    const status = body.accept ? "ACCEPTED" : "DECLINED";
    await prisma.$transaction(async (tx) => {
      await tx.clinicInvitation.update({
        where: { id },
        data: { status, respondedAt: new Date() },
      });
      if (body.accept) {
        await tx.doctor.update({ where: { id: doctor.id }, data: { clinicId: invitation.clinicId } });
      }
      await tx.notification.updateMany({
        where: { userId: doctor.userId, type: "CLINIC_INVITATION", data: { path: ["invitationId"], equals: id } },
        data: { readAt: new Date() },
      });
      await tx.notification.create({
        data: {
          id: randomUUID(),
          userId: invitation.clinic.userId,
          type: "CLINIC_INVITATION_RESPONSE",
          title: body.accept ? "Solicitacao aceita" : "Solicitacao recusada",
          message: `O medico ${doctor.name} ${body.accept ? "aceitou" : "recusou"} o convite para a clinica.`,
          data: { invitationId: id, doctorId: doctor.id, accepted: body.accept },
        },
      });
    });
    return res.send({ status });
  }
}
