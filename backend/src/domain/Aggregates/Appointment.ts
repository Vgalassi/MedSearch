import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";
import { CannotCancelAppointmentError } from "../errors/CannotCancelAppointmentError";
import { Time } from "../value-objects/Time";

export type AppointmentStatusValue =
  | "SCHEDULED"
  | "OCURRING"
  | "CANCELED"
  | "COMPLETED"
  | "NO_SHOW";

export type appointmentType = "OFFLINE" | "ONLINE"

export type AppointmentProps = {
  patientId: Identifier;
  doctorId: Identifier;
  startTime: Time;
  endTime: Time;
  day: Date;
  status: AppointmentStatusValue;
  reason?: string | null;
  notes?: string | null;
  type: appointmentType
};


export class Appointment extends AgregateRoot<AppointmentProps> {
  static createScheduled(input: {
    patientId: Identifier;
    doctorId: Identifier;
    startTime: Time;
    endTime: Time;
    day: Date;
    reason?: string | null;
    notes?: string | null;
    type: appointmentType
    id?: Identifier;
  }): Appointment {
    return new Appointment(
      {
        patientId: input.patientId,
        doctorId: input.doctorId,
        startTime: input.startTime,
        endTime: input.endTime,
        day: input.day,
        status: "SCHEDULED",
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        type: input.type
      },
      input.id,
    );
  }


  updateStatus(){
    const APPOINTMENT_EXTRA_DURATION = 600
    const today = new Date()
    if(today.getUTCFullYear() != this.props.day.getUTCFullYear() || today.getUTCMonth() != this.props.day.getUTCMonth()
       || today.getUTCDate() != this.props.day.getUTCDate()){
        return
    }
    const currentTime = today.getHours() * 3600 +  today.getMinutes() * 60 + today.getSeconds();
    const timeUntilAppointmentStart = this.props.startTime.value - currentTime
    if(this.props.status == "SCHEDULED"){

      
      if(Math.abs(timeUntilAppointmentStart) <= APPOINTMENT_EXTRA_DURATION){
          return this.props.status = "OCURRING"
      }
    }

    if(this.props.status == "OCURRING"){
      if(currentTime > this.props.endTime.value + APPOINTMENT_EXTRA_DURATION){
        return this.props.status = "COMPLETED"
      }
    }

  }

  cancel(): void {
    if (this.props.status !== "SCHEDULED") {
      throw new CannotCancelAppointmentError(this.props.status);
    }
    this.props.status = "CANCELED";
  }
}
