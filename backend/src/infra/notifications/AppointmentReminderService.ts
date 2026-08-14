import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";

const REMINDER_WINDOW_MS = 60_000;

function appointmentStartsAt(day: Date,startTimeInSeconds: number): Date {
  const hours = Math.floor(startTimeInSeconds / 3600);
  const minutes = Math.floor((startTimeInSeconds % 3600) / 60);
  const seconds = startTimeInSeconds % 60;

  return new Date(
    day.getUTCFullYear(),
    day.getUTCMonth(),
    day.getUTCDate(),
    hours,
    minutes,
    seconds
  );
}

export async function createDueAppointmentReminders() {

  const now = new Date();
  const target = new Date(now.getTime() + 5 * 60_000);
  const appointments = await prisma.appointment.findMany({
    where: { status: "SCHEDULED", day: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) } },
    include: { patient: true, doctor: true },
  });

 
  for (const appointment of appointments) {

    const startsAt = appointmentStartsAt(appointment.day, appointment.startTime);
    
    if (Math.abs(startsAt.getTime() - target.getTime()) > REMINDER_WINDOW_MS) continue;
    
    const key = `appointment-reminder:${appointment.id}`;
    const existing = await prisma.notification.count({ where: { type: "APPOINTMENT_REMINDER", data: { path: ["key"], equals: key } } });

    if (existing > 0) continue;
    
    const message = `Sua consulta com inicio as ${startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} comeca em 5 minutos.`;
    await prisma.notification.createMany({
      data: [
        { id: randomUUID(), userId: appointment.patient.userId, type: "APPOINTMENT_REMINDER", title: "Consulta em 5 minutos", message, data: { key, appointmentId: appointment.id } },
        { id: randomUUID(), userId: appointment.doctor.userId, type: "APPOINTMENT_REMINDER", title: "Consulta em 5 minutos", message, data: { key, appointmentId: appointment.id } },
      ],
      skipDuplicates: true,
    });
  }
}
