export class CannotCancelAppointmentError extends Error {
  constructor(currentStatus: string) {
    super(`Only SCHEDULED appointments can be canceled (status: ${currentStatus})`);
    this.name = "CannotCancelAppointmentError";
  }
}
