import type { AppointmentStatus } from "../../infra/generated/prisma";

export interface NotificationSender {
  sendNotification(notification: Notification): Notification;
  sendAppointmentStatusUpdateNotification(status: AppointmentStatus): Notification
}