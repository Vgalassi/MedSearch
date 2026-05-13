import { WeekDay } from "./WeekDay";
import { RangeIsNotValidError } from "../errors/RangeIsNotValidError";


export class WeekDayRange {
  constructor(private readonly _range: WeekDay[]) {
    this.validate();
  }

  public get range(): WeekDay[] {
    return this._range;
  }

  private validate(): void {
    if (this._range.length === 0 || this._range.length > 7) {
      throw new RangeIsNotValidError();
    }

    const values = this._range.map((day) => day.value);

    const uniqueValues = new Set(values);

    if (uniqueValues.size !== values.length) {
      throw new RangeIsNotValidError();
    }
  }
}