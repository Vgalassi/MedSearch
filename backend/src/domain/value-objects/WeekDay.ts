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

  public get value(): WeekDayType {
    return this._day;
  }
}