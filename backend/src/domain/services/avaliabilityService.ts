import { Doctor } from "../Aggregates/Doctor";
import { Availability } from "../entities/Availability";
import { WeekDay } from "../value-objects/WeekDay";
import { WeekDayRange } from "../value-objects/WeekDayRange";
import { Appointment } from "../Aggregates/Appointment";
import { Time } from "../value-objects/Time";
import type { AvailabilityMode } from "../value-objects/AvailabilityMode";

export type AvailableSlot = {
    startTime: Time
    endTime: Time
    mode: AvailabilityMode["value"]
}

export function getWeekDaysFromAvaliabilities(
    availabilities: Availability[]
): WeekDayRange{

    const weekDays = new Set<string>()

    for(const availability of availabilities){

        for(
            const weekDay
            of availability.props.weekDayRange.range
        ){

            weekDays.add(
                weekDay.value
            )
        }
    }

    return new WeekDayRange([...weekDays]
        .map(
            day => new WeekDay(day)
        ))
}


export function isOnDayRange(dayNumber: number, dayRange: WeekDayRange ){
    for(let i = 0; i< dayRange.range.length; i++){
        if(dayNumber === dayRange.range[i]?.getWeekNumber()){
            return true
        }
    }
    return false
}


function mergeSlotMode(currentMode: AvailableSlot["mode"], nextMode: AvailableSlot["mode"]): AvailableSlot["mode"] {
    if(currentMode === nextMode){
        return currentMode
    }
    return "BOTH"
}

function addAvailableSlot(slots: AvailableSlot[], nextSlot: AvailableSlot){
    const existingSlot = slots.find(slot => slot.startTime.value === nextSlot.startTime.value)
    if(existingSlot){
        existingSlot.mode = mergeSlotMode(existingSlot.mode, nextSlot.mode)
        return
    }
    slots.push(nextSlot)
}

export function getAvaliableDayTimes(appointments: Appointment[], day: Date, doctor: Doctor): AvailableSlot[]{
    if(!doctor.props.schedulingSettings || !doctor.props.Availabilities){
        throw Error("Doctor scheduling settings or availabilities not found")
    }
    const defaultDuration = doctor.props.schedulingSettings?.props.defaultDuration
    if(!defaultDuration){
        return []
    }
    const dayAvailabilities = doctor.props.Availabilities.filter((availability) => {
        return isOnDayRange(day.getUTCDay(), availability.props.weekDayRange)
    })
    if(dayAvailabilities.length == 0){
        return []
    }

    const dateAppointments =
    appointments.filter(
        appointment =>
            appointment.props.day
            .toDateString() ===
            day.toDateString()
    )
   

    const availableSlots: AvailableSlot[] = []
    const buffer = doctor.props.schedulingSettings.props.bufferBetween.value
    for(const availability of dayAvailabilities){
        let currentSeconds =
            availability
            .props
            .startTime
            .value

        const endSeconds =
            availability
            .props
            .endTime
            .value

        while(currentSeconds + defaultDuration.value   <= endSeconds){
            const slotStart = Time.createWithSeconds(currentSeconds)
            const slotEnd =  Time.createWithSeconds(currentSeconds + defaultDuration.value)

            const occupied =
                dateAppointments.some(
                    appointment =>

                    slotStart.value <
                    appointment.props
                    .endTime
                    .value

                    &&

                    slotEnd.value >
                    appointment.props
                    .startTime
                    .value
                )

            if(!occupied){
                addAvailableSlot(availableSlots, {
                    startTime: slotStart,
                    endTime: slotEnd,
                    mode: availability.props.mode.value,
                })
            }
            currentSeconds +=
                defaultDuration.value + buffer
        }

    }
    return availableSlots
}


export function getAvaliableDays(doctor: Doctor, appointments: Appointment[]){
    if(!doctor.props.schedulingSettings || !doctor.props.Availabilities){
        throw Error("Doctor scheduling settings or availabilities not found")
    }
    const today = new Date()
    const { maxSchedulingDays } = doctor.props.schedulingSettings.props
    const avaliabilities = doctor.props.Availabilities
    const avaliableDays: Date[] = []
    const weekDays = getWeekDaysFromAvaliabilities(avaliabilities)
    for(let i = 0; i < maxSchedulingDays; i++){
        const current = new Date(today)
        current.setDate(today.getDate() + i)
        if(isOnDayRange(current.getUTCDay(),weekDays) && getAvaliableDayTimes(appointments,current,doctor).length > 0){
            avaliableDays.push(current)
        }

    }


    return avaliableDays
}
