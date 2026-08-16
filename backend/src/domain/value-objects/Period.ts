export class Period {
  private readonly _hours: number;
  private readonly _minutes: number;
  private readonly _value: number;

  constructor(hours: number, minutes: number) {
    if (!Number.isInteger(hours) || hours < 0) {
      throw new Error("Invalid period hours");
    }
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
      throw new Error("Invalid period minutes");
    }

    this._hours = hours;
    this._minutes = minutes;
    this._value = hours * 3600 + minutes * 60;
  }

  static createWithSeconds(seconds: number): Period {
    if (!Number.isInteger(seconds) || seconds < 0) {
      throw new Error("Invalid period seconds");
    }

    return new Period(
      Math.floor(seconds / 3600),
      Math.floor((seconds % 3600) / 60),
    );
  }

  static createWithString(period: string): Period {
    const match = /^(\d+):([0-5]\d)$/.exec(period);
    if (!match) {
      throw new Error("Invalid period. Expected HH:mm");
    }

    return new Period(Number(match[1]), Number(match[2]));
  }

  get hours(): number {
    return this._hours;
  }

  get minutes(): number {
    return this._minutes;
  }

  get value(): number {
    return this._value;
  }

  toString(): string {
    return `${String(this._hours).padStart(2, "0")}:${String(this._minutes).padStart(2, "0")}`;
  }
}
