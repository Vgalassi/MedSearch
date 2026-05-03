export class DoctorSettingsNotFoundError extends Error {
  constructor(doctorId: string) {
    super(`Doctor settings not found for doctor ${doctorId}`);
    this.name = "DoctorSettingsNotFoundError";
  }
}
