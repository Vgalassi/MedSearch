import { Entity } from "../value-objects/Entity";
import type { Identifier } from "../value-objects/Identifier";


export type NotificationType = 
    "APPOINTMENT_REMINDER" |
    "CLINIC_INVITATION_RESPONSE" |
    "CLINIC_INVITATION";


export type notificationProps = {
    userid: Identifier,
    type: NotificationType,
    title: string,
    message: string,
    data: object

}


export class Notification extends Entity<notificationProps>{



}