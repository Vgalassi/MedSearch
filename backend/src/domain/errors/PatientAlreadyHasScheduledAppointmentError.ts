export class PatientAlreadyHasScheduledAppointmentError extends Error {
  constructor() {
    super("O paciente já possui uma consulta agendada com este médico.");
    this.name = "PatientAlreadyHasScheduledAppointmentError";
  }
}
