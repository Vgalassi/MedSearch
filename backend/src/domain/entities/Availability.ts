import { toMinutes } from "../services/times";
import { Entity } from "../value-objects/Entity";
import { Identifier } from "../value-objects/Identifier";


export type AvailabilityProps = {
    doctorId: Identifier,
    isAvailable: boolean,
    weekDay: number,
    startTime: number,
    endTime: number
}

export class Availability extends Entity<AvailabilityProps>{
    static createDefault(doctorId: Identifier): Availability{
        return new Availability(
            {
                doctorId,
                isAvailable: true,
                weekDay: 6,
                startTime: toMinutes(8,0),
                endTime: toMinutes(17,30)
            }
        )

        
    }
}