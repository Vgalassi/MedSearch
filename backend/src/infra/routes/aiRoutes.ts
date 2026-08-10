import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { TYPES } from "../../app/dto/types";
import { FindClinicsForSymptomsUseCase } from "../../app/usecases/FindClinicsForSymptomsUseCase";
import { AiController } from "../controllers/AiController";
import { container } from "../di/container";

const aiController = new AiController(
  container.get<FindClinicsForSymptomsUseCase>(TYPES.FindClinicsForSymptomsUseCase),
);

export default async function aiRoutes(app: FastifyInstance) {
  app.post("/ai/symptoms", async (req: FastifyRequest, res: FastifyReply) => {
    await aiController.analyzeSymptoms(req, res);
  });
}
