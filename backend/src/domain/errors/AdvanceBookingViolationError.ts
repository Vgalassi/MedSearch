export class AdvanceBookingViolationError extends Error {
  constructor(advanceBookingHours: number) {
    super(
      `Appointment must be at least ${advanceBookingHours} hour(s) ahead of the current time`,
    );
    this.name = "AdvanceBookingViolationError";
  }
}
