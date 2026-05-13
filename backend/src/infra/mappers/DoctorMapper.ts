import { Doctor } from "../../domain/Aggregates/Doctor";
import { Availability } from "../../domain/entities/Availability";
import { DoctorSchedulingSettings } from "../../domain/entities/DoctorSchedulingSettings";
import { Identifier } from "../../domain/value-objects/Identifier";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber";
import { Time } from "../../domain/value-objects/Time";
import { WeekDay as DomainWeekDay } from "../../domain/value-objects/WeekDay";
import { WeekDayRange } from "../../domain/value-objects/WeekDayRange";
import type { WeekDay as PrismaWeekDay } from "../generated/prisma/client";

type PrismaDoctorSettings = {
  id: string;
  doctorId: string;
  isAvaliable: boolean;
  minAppointmentTime: number;
  maxAppointmentTime: number;
  defaultDuration: number;
  bufferBetween: number;
  advanceBookingHours: number;
  maxDailyAppointments: number | null;
};

type PrismaAvailability = {
  id: string;
  doctorId: string;
  weekdays: PrismaWeekDay[];
  startMinutes: number;
  endMinutes: number;
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
  availabilities?: PrismaAvailability[];
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
                isAvaliable: raw.settings.isAvaliable,
                minAppointmentTime: Time.createWithSeconds(
                  raw.settings.minAppointmentTime,
                ),
                maxAppointmentTime: Time.createWithSeconds(
                  raw.settings.maxAppointmentTime,
                ),
                defaultDuration: Time.createWithSeconds(
                  raw.settings.defaultDuration,
                ),
                bufferBetween: Time.createWithSeconds(
                  raw.settings.bufferBetween,
                ),
                advanceBookingHours: raw.settings.advanceBookingHours,
                maxDailyAppointments: raw.settings.maxDailyAppointments,
              },
              new Identifier(raw.settings.id),
            )
          : null,
        Availabilities:
          raw.availabilities?.map(
            (availability) =>
              new Availability(
                {
                  doctorId: new Identifier(availability.doctorId),
                  weekDayRange: new WeekDayRange(
                    availability.weekdays.map(
                      (day) => new DomainWeekDay(day),
                    ),
                  ),
                  startTime: Time.createWithSeconds(
                    availability.startMinutes,
                  ),
                  endTime: Time.createWithSeconds(availability.endMinutes),
                },
                new Identifier(availability.id),
              ),
          ) ?? null,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(doctor: Doctor): DoctorPersistence {
    const settings = doctor.props.schedulingSettings;
    const availabilities = doctor.props.Availabilities;

    const persistence: DoctorPersistence = {
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
            isAvaliable: settings.props.isAvaliable,
            minAppointmentTime: settings.props.minAppointmentTime.value,
            maxAppointmentTime: settings.props.maxAppointmentTime.value,
            defaultDuration: settings.props.defaultDuration.value,
            bufferBetween: settings.props.bufferBetween.value,
            advanceBookingHours: settings.props.advanceBookingHours,
            maxDailyAppointments: settings.props.maxDailyAppointments,
          }
        : null,
    };

    if (availabilities) {
      persistence.availabilities = availabilities.map((availability) => ({
        id: availability.id.value,
        doctorId: availability.props.doctorId.value,
        weekdays: availability.props.weekDayRange.range.map(
          (day) => day.value as PrismaWeekDay,
        ),
        startMinutes: availability.props.startTime.value,
        endMinutes: availability.props.endTime.value,
      }));
    }

    return persistence;
  }
}
