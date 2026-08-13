import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { NotificationController } from "../controllers/NotificationController";

const notificationController = new NotificationController();

export default async function notificationRoutes(app: FastifyInstance) {
  app.get("/notifications", async (req: FastifyRequest, res: FastifyReply) => notificationController.list(req, res));
  app.patch("/notifications/:id/read", async (req: FastifyRequest, res: FastifyReply) => notificationController.markRead(req, res));
  app.patch("/clinic-invitations/:id/respond", async (req: FastifyRequest, res: FastifyReply) => notificationController.respondToInvitation(req, res));
}
