import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { SymptomClassifier } from "../protocols/SymptomClassifier";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { LowConfidenceClassificationError } from "../../domain/errors/LowConfidenceClassificationError";

const MINIMUM_CLASSIFICATION_CONFIDENCE = 0.32;

type Coordinates = { latitude: number; longitude: number };

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function calculateDistance(origin: Coordinates, destination: Coordinates): number {
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

@injectable()
export class FindClinicsForSymptomsUseCase {
  constructor(
    @inject(TYPES.SymptomClassifier) private readonly classifier: SymptomClassifier,
    @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
    @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(input: { symptoms: string } & Coordinates) {
    const classification = await this.classifier.classify(input.symptoms);
    if (classification.confidence <= MINIMUM_CLASSIFICATION_CONFIDENCE) {
      throw new LowConfidenceClassificationError();
    }
    const specialities = classification.speciality.split("/").map(normalize);
    const [clinics, doctors] = await Promise.all([this.clinicRepository.findAll(), this.doctorRepository.findAll()]);
    const doctorsByClinic = new Map<string, Array<{ id: string; name: string; speciality: string }>>();

    for (const doctor of doctors) {
      const clinicId = doctor.props.clinicId?.value;
      if (!clinicId || !specialities.includes(normalize(doctor.props.speciality))) continue;
      const items = doctorsByClinic.get(clinicId) ?? [];
      items.push({ id: doctor.id.value, name: doctor.props.name, speciality: doctor.props.speciality });
      doctorsByClinic.set(clinicId, items);
    }

    const recommendedClinics = clinics.flatMap((clinic) => {
      const clinicDoctors = doctorsByClinic.get(clinic.id.value);
      const { latitude, longitude } = clinic.props.address;
      if (!clinicDoctors || typeof latitude !== "number" || typeof longitude !== "number") return [];
      return [{
        id: clinic.id.value,
        name: clinic.props.name,
        phone: clinic.props.phone.value,
        street: clinic.props.address.street,
        city: clinic.props.address.city,
        state: clinic.props.address.state,
        number: clinic.props.address.number,
        cep: clinic.props.address.cep.value,
        description: clinic.props.description,
        latitude,
        longitude,
        distanceInKm: calculateDistance(input, { latitude, longitude }),
        doctors: clinicDoctors,
      }];
    }).sort((left, right) => left.distanceInKm - right.distanceInKm).slice(0, 3);

    return { classification, clinics: recommendedClinics };
  }
}
