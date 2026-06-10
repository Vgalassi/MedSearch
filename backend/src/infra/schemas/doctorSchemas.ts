import { z } from "zod";

export const doctorIdParamSchema = z.object({
  id: z.uuid(),
});

export const doctorAvailableHoursSchema = z.object({
  date: z.iso.date()
})

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const availabilityModeSchema = z.enum(["ONLINE", "OFFLINE", "BOTH"]);

export const updateDoctorSchedulingSchema = z.object({
  settings: z.object({
    isAvaliable: z.boolean(),
    defaultDuration: timeSchema.refine((value) => value !== "00:00", {
      message: "defaultDuration must be greater than 00:00",
    }),
    bufferBetween: timeSchema,
    advanceBookingHours: z.number().int().nonnegative(),
    maxSchedulingDays: z.number().int().positive(),
    maxDailyAppointments: z.number().int().positive().nullable(),
  }),
  availabilities: z.array(
    z.object({
      weekdays: z.array(
        z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
      ).min(1).max(7).refine(
        (weekdays) => new Set(weekdays).size === weekdays.length,
        { message: "weekdays must not contain duplicates" },
      ),
      startTime: timeSchema,
      endTime: timeSchema,
      mode: availabilityModeSchema.default("OFFLINE"),
    }),
  ).min(1),
});
