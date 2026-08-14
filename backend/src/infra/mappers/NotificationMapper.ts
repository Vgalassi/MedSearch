import { Notification } from "../../domain/entities/Notification";
import type { NotificationData, NotificationType } from "../../domain/entities/Notification";
import { Identifier } from "../../domain/value-objects/Identifier";


type PrismaNotification = {
    id: string;
    userId: string;
    type:
        | "APPOINTMENT_REMINDER"
        | "CLINIC_INVITATION_RESPONSE"
        | "CLINIC_INVITATION";
    title: string;
    message: string;
    data: unknown | null;
    readAt: Date | null;
    createdAt: Date;
};



export class NotificationMapper {

    static toDomain(
        notification: PrismaNotification
    ): Notification {

        return new Notification(
            {
                userId: new Identifier(notification.userId),
                type: notification.type as NotificationType,
                title: notification.title,
                message: notification.message,
                data: notification.data as NotificationData | null,
                readAt: notification.readAt
            },
            new Identifier(notification.id)
        );
    }

    static toPersistence(
        notification: Notification
    ) {
        return {
            id: notification.id.value,
            userId: notification.props.userId.value,
            type: notification.props.type,
            title: notification.props.title,
            message: notification.props.message,
            data: notification.props.data,
            readAt: notification.props.readAt,
            createdAt: new Date(),
        };
    }
}