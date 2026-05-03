export class InvalidAppointmentDurationError extends Error {
  constructor(minMinutes: number, maxMinutes: number, actualMinutes: number) {
    super(
      `Appointment duration must be between ${minMinutes} and ${maxMinutes} minutes (got ${actualMinutes})`,
    );
    this.name = "InvalidAppointmentDurationError";
  }
}
