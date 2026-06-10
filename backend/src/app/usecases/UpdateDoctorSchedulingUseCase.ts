import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import { Doctor } from "../../domain/Aggregates/Doctor";
import { Availability } from "../../domain/entities/Availability";
import { DoctorSchedulingSettings } from "../../domain/entities/DoctorSchedulingSettings";
import { InvalidAppointmentTimeOrderError } from "../../domain/errors/InvalidAppointmentTimeOrderError";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { Identifier } from "../../domain/value-objects/Identifier";
import { Time } from "../../domain/value-objects/Time";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { WeekDayRange } from "../../domain/value-objects/WeekDayRange";
import { AvailabilityMode } from "../../domain/value-objects/AvailabilityMode";

type AvailabilityInput = {
  weekdays: string[];
  startTime: string;
  endTime: string;
  mode: string;
};

type UpdateDoctorSchedulingInput = {
  doctorId: string;
  settings: {
    isAvaliable: boolean;
    defaultDuration: string;
    bufferBetween: string;
    advanceBookingHours: number;
    maxSchedulingDays: number;
    maxDailyAppointments: number | null;
  };
  availabilities: AvailabilityInput[];
};

@injectable()
export class UpdateDoctorSchedulingUseCase {
  constructor(
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(input: UpdateDoctorSchedulingInput): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", input.doctorId);
    }

    const doctorId = new Identifier(input.doctorId);

    const settings = new DoctorSchedulingSettings(
      {
        doctorId,
        isAvaliable: input.settings.isAvaliable,
        defaultDuration: Time.createWithString(
          input.settings.defaultDuration,
        ),
        bufferBetween: Time.createWithString(input.settings.bufferBetween),
        advanceBookingHours: input.settings.advanceBookingHours,
        maxSchedulingDays: input.settings.maxSchedulingDays,
        maxDailyAppointments: input.settings.maxDailyAppointments,
      },
      doctor.props.schedulingSettings?.id,
    );

    const availabilities = input.availabilities.map((availability) => {
      const startTime = Time.createWithString(availability.startTime);
      const endTime = Time.createWithString(availability.endTime);

      if (startTime.value >= endTime.value) {
        throw new InvalidAppointmentTimeOrderError();
      }

      return new Availability({
        doctorId,
        weekDayRange: new WeekDayRange(
          availability.weekdays.map((weekday) => new WeekDay(weekday)),
        ),
        startTime,
        endTime,
        mode: new AvailabilityMode(availability.mode),
      });
    });

    const updatedDoctor = new Doctor(
      {
        ...doctor.props,
        schedulingSettings: settings,
        Availabilities: availabilities,
      },
      doctor.id,
    );

    return this.doctorRepository.updateScheduling(updatedDoctor);
  }
}
