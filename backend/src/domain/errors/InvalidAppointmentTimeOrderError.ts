export class InvalidAppointmentTimeOrderError extends Error {
  constructor() {
    super("endTime must be after startTime");
    this.name = "InvalidAppointmentTimeOrderError";
  }
}
