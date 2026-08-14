import type { AppointmentStatus } from "../../infra/generated/prisma";
import type { Appointment } from "../Aggregates/Appointment";
import { Entity } from "../value-objects/Entity";
import type { Identifier } from "../value-objects/Identifier";


export type NotificationData = {
    [key: string]: string | number | boolean | null;
};


export type NotificationType = 
    "APPOINTMENT_REMINDER" |
    "CLINIC_INVITATION_RESPONSE" |
    "CLINIC_INVITATION" |
    "STATUS_NOTIFICATION"


export type notificationProps = {
    userId: Identifier,
    type: NotificationType,
    title: string,
    message: string,
    data: NotificationData | null
    readAt: Date | null

}


export class Notification extends Entity<notificationProps>{

    constructor(props: notificationProps){
        super(props)
    }

    static createAppointmentReminderNotification(targetUserId: Identifier, appointment: Appointment): Notification{

        let message = `Sua consulta com ínicio às ${appointment.props.startTime.toString()} começa em 10 minutos. Já é possível entrar na sala`
        if(appointment.props.type == "OFFLINE"){
            message =  `Sua consulta com ínicio às ${appointment.props.startTime.toString()} começa em 10 minutos.`
        }
        return new Notification(
            {
                userId: targetUserId,
                type: "APPOINTMENT_REMINDER",
                title: "Consulta em 10 minutos ",
                message,
                data: null,
                readAt: null
            }
        )
    }


}