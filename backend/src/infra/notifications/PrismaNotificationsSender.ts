import type { NotificationSender } from "../../app/protocols/NotificationSender";
import type { AppointmentStatus } from "../generated/prisma";


export class PrismaNotificationSender implements NotificationSender{
    sendNotification(notification: Notification): Notification {
        throw new Error("Method not implemented.");
    }
    sendAppointmentStatusUpdateNotification(status: AppointmentStatus): Notification {
        throw new Error("Method not implemented.");
    }


    
}