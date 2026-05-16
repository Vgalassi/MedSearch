import { InvalidArgumentError } from "../errors/InvalidArgumentError";

const VALID_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

type WeekDayType = typeof VALID_DAYS[number];

export class WeekDay {
  private _day: WeekDayType;

  constructor(day: string) {
    this.validate(day);

    this._day = day as WeekDayType;
  }

  private validate(day: string): void {
    if (!VALID_DAYS.includes(day as WeekDayType)) {
      throw new InvalidArgumentError("weekday");
    }
  }

  public getWeekNumber(): number {

      const map: Record<WeekDayType, number> = {
          MONDAY: 1,
          TUESDAY: 2,
          WEDNESDAY: 3,
          THURSDAY: 4,
          FRIDAY: 5,
          SATURDAY: 6,
          SUNDAY: 0
      }

      return map[this._day]
  }

  public get value(): WeekDayType {
    return this._day;
  }
}