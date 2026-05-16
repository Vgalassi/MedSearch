import { Doctor } from "../Aggregates/Doctor";
import { Availability } from "../entities/Availability";
import { WeekDay } from "../value-objects/WeekDay";
import { WeekDayRange } from "../value-objects/WeekDayRange";
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



export function getAvaliableDays(doctor: Doctor){
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
        if(isOnDayRange(current.getDay(),weekDays)){
            avaliableDays.push(current)
        }

    }
    return avaliableDays
}