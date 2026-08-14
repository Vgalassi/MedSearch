import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { NotificationService } from "./notificationService";


export class AppointmentService{
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly notificationService: NotificationService
    ){}

    async updateAppointmentStatuses(){

        const now = new Date()
        const appointments = await this.appointmentRepository.findTodayScheduledOrOcurring(now)

        for(const appointment of appointments){
            const oldStatus = appointment.props.status
            appointment.updateStatus()
            const newStatus = appointment.props.status;
            if(oldStatus !== newStatus){
                await this.appointmentRepository.update(appointment);
                if(newStatus == "OCURRING"){
                    await this.notificationService.createAppointmentReminderNotification(appointment)
                }
            }
        }
    }
}


