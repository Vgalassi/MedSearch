import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type {
  ClinicListParams,
  ClinicRepository,
  PaginatedClinics,
} from "../../domain/repositories/ClinicRepository";
import type { Clinic } from "../../domain/Aggregates/Clinic";

@injectable()
export class GetAllClinicsUseCase {
  constructor(
    @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
  ) {}

  async execute(): Promise<Clinic[]>;
  async execute(params: Partial<ClinicListParams>): Promise<PaginatedClinics>;
  async execute(params?: Partial<ClinicListParams>): Promise<Clinic[] | PaginatedClinics> {
    if (!params) {
      return this.clinicRepository.findAll();
    }

    const listParams: ClinicListParams = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 12,
    };

    if (params.search) {
      listParams.search = params.search;
    }

    if (typeof params.latitude === "number") {
      listParams.latitude = params.latitude;
    }

    if (typeof params.longitude === "number") {
      listParams.longitude = params.longitude;
    }

    return this.clinicRepository.findMany(listParams);
  }
}
