import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { NotificationSender } from "../protocols/NotificationSender";

export class AppointmentService{
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly notifcationSender: NotificationSender
    ){}

    async updateAppointmentStatuses(){

        const now = new Date()
        const appointments = await this.appointmentRepository.findTodayScheduledOrOcurring(now)

        for(const appointment of appointments){
            const oldStatus = appointment.props.status
            appointment.updateStatus()
            const newStatus = appointment.props.status;
            if(oldStatus !== newStatus){
                await this.appointmentRepository.create(appointment);
                await this.notifcationSender.sendAppointmentStatusUpdateNotification(newStatus)
            }
        }


    }
}


