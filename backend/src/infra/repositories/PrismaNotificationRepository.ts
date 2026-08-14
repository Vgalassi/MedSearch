import { Notification } from "../../domain/entities/Notification";
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { prisma } from "../../lib/prisma";
import { NotificationMapper } from "../mappers/NotificationMapper";


export class PrismaNotificationRepository implements NotificationRepository{
    async save(notification: Notification): Promise<Notification> {
        const data = NotificationMapper.toPersistence(notification);
        const createdNotification = await prisma.notification.create({
        data: {
            ...data,
            data: data.data as any,
        },
    });

        return NotificationMapper.toDomain(createdNotification as never);
    }
    async update(notification: Notification): Promise<Notification | null> {
        const data =NotificationMapper.toPersistence(notification);

            const updated = await prisma.notification.update({
              where: { id: data.id },
              data: {
                readAt: notification.props.readAt
              },
            });
            return NotificationMapper.toDomain(updated as never);
    }


    async findByUserId(userId: string): Promise<Notification[] | null> {
        const rows = await prisma.notification.findMany({
              where: { userId },
              orderBy: { createdAt: "desc" }
        });

        if (rows.length === 0) {
            return null;
        }
        
        return rows.map((r) => NotificationMapper.toDomain(r as never));
    }
    
}