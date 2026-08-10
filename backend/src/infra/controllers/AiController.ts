import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { FindClinicsForSymptomsUseCase } from "../../app/usecases/FindClinicsForSymptomsUseCase";
import { Auth } from "../auth/authDecorator";
import { symptomsAnalysisSchema } from "../schemas/aiSchema";

@injectable()
export class AiController {
  constructor(
    @inject(TYPES.FindClinicsForSymptomsUseCase)
    private readonly findClinicsForSymptomsUseCase: FindClinicsForSymptomsUseCase,
  ) {}

  @Auth("PATIENT")
  async analyzeSymptoms(req: FastifyRequest, res: FastifyReply) {
    const body = symptomsAnalysisSchema.parse(req.body);
    const result = await this.findClinicsForSymptomsUseCase.execute(body);

    return res.status(200).send({
      speciality: result.classification.speciality,
      confidence: result.classification.confidence,
      clinics: result.clinics,
      disclaimer: "Esta sugestão não substitui uma avaliação médica. Em caso de urgência, procure atendimento imediato.",
    });
  }
}
