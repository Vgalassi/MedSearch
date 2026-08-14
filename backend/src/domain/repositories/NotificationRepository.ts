import type { Notification } from "../entities/Notification"

export interface NotificationRepository {
    save(notification: Notification): Promise<Notification>
    update(notification: Notification ): Promise<Notification | null>
    findByUserId(userId: string): Promise<Notification[] | null >
}
