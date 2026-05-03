export class AppointmentOutsideAvailabilityError extends Error {
  constructor() {
    super("Appointment is outside the doctor's availability window");
    this.name = "AppointmentOutsideAvailabilityError";
  }
}
