import { Doctor } from "../../domain/Aggregates/Doctor";
import { DoctorSchedulingSettings } from "../../domain/entities/DoctorSchedulingSettings";
import { Identifier } from "../../domain/value-objects/Identifier";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber";

type PrismaDoctorSettings = {
  id: string;
  doctorId: string;
  minAppointmentTime: number;
  maxAppointmentTime: number;
  defaultDuration: number;
  bufferBetween: number;
  advanceBookingHours: number;
  maxDailyAppointments: number | null;
};

type PrismaDoctor = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  crm: string;
  speciality: string;
  clinicId: string | null;
  settings?: PrismaDoctorSettings | null;
};

export type DoctorPersistence = PrismaDoctor;

export class DoctorMapper {
  static toDomain(raw: PrismaDoctor): Doctor {
    return new Doctor(
      {
        userId: new Identifier(raw.userId),
        name: raw.name,
        phone: new PhoneNumber(raw.phone),
        crm: raw.crm,
        speciality: raw.speciality,
        clinicId: raw.clinicId ? new Identifier(raw.clinicId) : null,
        schedulingSettings: raw.settings
          ? new DoctorSchedulingSettings(
              {
                doctorId: new Identifier(raw.settings.doctorId),
                minAppointmentTime: raw.settings.minAppointmentTime,
                maxAppointmentTime: raw.settings.maxAppointmentTime,
                defaultDuration: raw.settings.defaultDuration,
                bufferBetween: raw.settings.bufferBetween,
                advanceBookingHours: raw.settings.advanceBookingHours,
                maxDailyAppointments: raw.settings.maxDailyAppointments,
              },
              new Identifier(raw.settings.id),
            )
          : null,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(doctor: Doctor): DoctorPersistence {
    const settings = doctor.props.schedulingSettings;

    return {
      id: doctor.id.value,
      userId: doctor.props.userId.value,
      name: doctor.props.name,
      phone: doctor.props.phone.value,
      crm: doctor.props.crm,
      speciality: doctor.props.speciality,
      clinicId: doctor.props.clinicId?.value ?? null,
      settings: settings
        ? {
            id: settings.id.value,
            doctorId: settings.props.doctorId.value,
            minAppointmentTime: settings.props.minAppointmentTime,
            maxAppointmentTime: settings.props.maxAppointmentTime,
            defaultDuration: settings.props.defaultDuration,
            bufferBetween: settings.props.bufferBetween,
            advanceBookingHours: settings.props.advanceBookingHours,
            maxDailyAppointments: settings.props.maxDailyAppointments,
          }
        : null,
    };
  }
}
