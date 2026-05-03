export class DailyAppointmentLimitReachedError extends Error {
  constructor(maxDaily: number) {
    super(`Daily appointment limit reached (${maxDaily}) for this doctor`);
    this.name = "DailyAppointmentLimitReachedError";
  }
}
