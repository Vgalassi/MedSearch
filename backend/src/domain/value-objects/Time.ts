export class Time {
  private readonly _hour: number;
  private readonly _minute: number;

  constructor(hour: number, minute: number) {
    this.validate(hour, minute);

    this._hour = hour;
    this._minute = minute;
  }

  private validate(hour: number, minute: number): void {
    if (hour < 0 || hour > 23) {
      throw new Error("Invalid hour");
    }

    if (minute < 0 || minute > 59) {
      throw new Error("Invalid minute");
    }
  }

  public isBehind(comparedTime: Time): boolean{
    const seconds = this.hour * 3600 + this.minute * 60
    const comparedSeconds = comparedTime.hour * 3600 + comparedTime.minute * 60
    if(comparedSeconds < seconds){
        return true
    }
    return false 
  }

  public get hour(): number {
    return this._hour;
  }

  public get minute(): number {
    return this._minute;
  }

  public toString(): string {
    return `${String(this._hour).padStart(2, "0")}:${String(
      this._minute
    ).padStart(2, "0")}`;
  }
}