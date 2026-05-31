import { injectable } from "inversify";
import { Clinic } from "../../domain/Aggregates/Clinic";
import type {
  ClinicListParams,
  ClinicRepository,
  PaginatedClinics,
} from "../../domain/repositories/ClinicRepository";
import { prisma } from "../../lib/prisma";
import type { Prisma } from "../generated/prisma";
import { ClinicMapper } from "../mappers/ClinicMapper";

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function calculateDistanceInKm(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
): number {
  const earthRadiusInKm = 6371;
  const deltaLatitude = toRadians(destinationLatitude - originLatitude);
  const deltaLongitude = toRadians(destinationLongitude - originLongitude);
  const originLatitudeRad = toRadians(originLatitude);
  const destinationLatitudeRad = toRadians(destinationLatitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitudeRad) *
      Math.cos(destinationLatitudeRad) *
      Math.sin(deltaLongitude / 2) ** 2;

  return (
    earthRadiusInKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

@injectable()
export class PrismaClinicRepository implements ClinicRepository {
  async save(clinic: Clinic): Promise<Clinic> {
    const data = ClinicMapper.toPersistence(clinic);

    const createdClinic = await prisma.clinic.create({
      data,
    });

    return ClinicMapper.toDomain(createdClinic as never);
  }

  async findById(id: string): Promise<Clinic | null> {
    const clinic = await prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      return null;
    }

    return ClinicMapper.toDomain(clinic as never);
  }

  async findAll(): Promise<Clinic[]> {
    const clinics = await prisma.clinic.findMany();
    return clinics.map((clinic) => ClinicMapper.toDomain(clinic as never));
  }

  async findMany(params: ClinicListParams): Promise<PaginatedClinics> {
    const page = Math.max(params.page, 1);
    const pageSize = Math.min(Math.max(params.pageSize, 1), 50);
    const search = params.search?.trim();
    const hasLocation =
      typeof params.latitude === "number" && typeof params.longitude === "number";

    const where: Prisma.ClinicWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { street: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
            { state: { contains: search, mode: "insensitive" as const } },
            { cep: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    if (!hasLocation) {
      const [total, clinics] = await Promise.all([
        prisma.clinic.count({
          ...(where ? { where } : {}),
        }),
        prisma.clinic.findMany({
          ...(where ? { where } : {}),
          orderBy: { name: "asc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return {
        items: clinics.map((clinic) => ({
          clinic: ClinicMapper.toDomain(clinic as never),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    const clinics = await prisma.clinic.findMany({
      ...(where ? { where } : {}),
    });
    const sortedClinics = clinics
      .map((clinic) => ({
        clinic: ClinicMapper.toDomain(clinic as never),
        distanceInKm: calculateDistanceInKm(
          params.latitude as number,
          params.longitude as number,
          clinic.latitude,
          clinic.longitude,
        ),
      }))
      .sort((current, next) => current.distanceInKm - next.distanceInKm);

    const total = sortedClinics.length;

    return {
      items: sortedClinics.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
