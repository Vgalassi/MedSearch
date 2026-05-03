export class AppointmentSchedulingConflictError extends Error {
  constructor() {
    super(
      "This time conflicts with another appointment or violates the buffer between consultations",
    );
    this.name = "AppointmentSchedulingConflictError";
  }
}
