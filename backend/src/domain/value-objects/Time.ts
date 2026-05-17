export class Time {
  private readonly _hour: number;
  private readonly _minute: number;
  private readonly _value: number

  constructor(hour: number, minute: number) {
    this.validate(hour, minute);
    this._hour = hour;
    this._minute = minute;
    this._value = this.hour * 3600 + this.minute * 60
  }

  private validate(hour: number, minute: number): void {
    if (hour < 0 || hour > 23) {
      throw new Error("Invalid hour");
    }

    if (minute < 0 || minute > 59) {
      throw new Error("Invalid minute");
    }
  }

  public static createWithSeconds(seconds: number){
     const hours = Math.floor(seconds/ 3600);
     const minutes = Math.floor((seconds% 3600) / 60);
     return new Time(hours,minutes)
  }
  
  public static createWithString(time: string): Time {
    const [hour, minute] =
        time.split(":")

    return new Time(
        Number(hour),
        Number(minute)
    )
}

  public isBehind(comparedTime: Time): boolean{
    const seconds = this.hour * 3600 + this.minute * 60
    const comparedSeconds = comparedTime.hour * 3600 + comparedTime.minute * 60
    if(comparedSeconds < seconds){
        return false
    }
    return true
  }

  public get hour(): number {
    return this._hour;
  }

  public get minute(): number {
    return this._minute;
  }

  public get value(): number {
    return this._value;
  }

  public toString(): string {
    return `${String(this._hour).padStart(2, "0")}:${String(
      this._minute
    ).padStart(2, "0")}`;
  }
}