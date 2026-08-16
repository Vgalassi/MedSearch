-- A patient may have only one scheduled appointment with the same doctor.
-- Canceled, completed and no-show appointments do not prevent a new booking.
CREATE UNIQUE INDEX "appointments_one_scheduled_per_patient_doctor"
ON "appointments" ("patientId", "doctorId")
WHERE "status" = 'SCHEDULED';
