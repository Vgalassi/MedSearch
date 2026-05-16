
import { WeekDayRange } from "../value-objects/WeekDayRange";
import { Entity } from "../value-objects/Entity";
import { Identifier } from "../value-objects/Identifier";
import { Time } from "../value-objects/Time";
import { WeekDay } from "../value-objects/WeekDay";

export type AvailabilityProps = {
    doctorId: Identifier,
    weekDayRange: WeekDayRange,
    startTime: Time,
    endTime: Time
}



export class Availability extends Entity<AvailabilityProps>{
    static createDefault(doctorId: Identifier): Availability{
        return new Availability(
            {
                doctorId,
                weekDayRange: new WeekDayRange([
                    new WeekDay("MONDAY"),
                    new WeekDay("TUESDAY"),
                    new WeekDay("WEDNESDAY"),
                    new WeekDay("THURSDAY"),
                    new WeekDay("FRIDAY")
                ]),
                startTime: new Time(8,0),
                endTime: new Time(17,30)
            }
        )

        
    }
}