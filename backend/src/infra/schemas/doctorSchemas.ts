import { z } from "zod";

export const doctorIdParamSchema = z.object({
  id: z.uuid(),
});

export const availableDoctorsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(6),
});

export const doctorAvailableHoursSchema = z.object({
  date: z.iso.date()
})

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const periodSchema = z.string().regex(/^\d+:[0-5]\d$/, {
  message: "minimumBookingNotice must use HH:mm and may exceed 24 hours",
});
const availabilityModeSchema = z.enum(["ONLINE", "OFFLINE", "BOTH"]);

export const updateDoctorSchedulingSchema = z.object({
  settings: z.object({
    isAvaliable: z.boolean(),
    defaultDuration: timeSchema.refine((value) => value !== "00:00", {
      message: "defaultDuration must be greater than 00:00",
    }),
    bufferBetween: timeSchema,
    minimumBookingNotice: periodSchema,
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
