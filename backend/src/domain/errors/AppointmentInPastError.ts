export class AppointmentInPastError extends Error {
  constructor() {
    super("Cannot schedule an appointment in the past");
    this.name = "AppointmentInPastError";
  }
}
