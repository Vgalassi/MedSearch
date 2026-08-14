export class TimeZoneDate {
    
    private readonly _year: number;
    private readonly _month: number;
    private readonly _day: number;
    private readonly _hour: number;
    private readonly _minute: number;
    private readonly _second: number;
    private readonly _date: Date;
    

    constructor(
    date: Date = new Date(),
    convertTimezone: boolean = true
) {
    if (convertTimezone) {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
        }).formatToParts(date);

        const get = (type: string) =>
            Number(parts.find(p => p.type === type)?.value);

        this._year = get("year");
        this._month = get("month");
        this._day = get("day");
        this._hour = get("hour");
        this._minute = get("minute");
        this._second = get("second");

        this._date = new Date(
        Date.UTC(
            this._year,
            this._month - 1,
            this._day
        )
       )
        return this

    }
        this._year = date.getUTCFullYear();
        this._month = date.getUTCMonth() + 1;
        this._day = date.getUTCDate();
        this._hour = date.getUTCHours();
        this._minute = date.getUTCMinutes();
        this._second = date.getUTCSeconds();
        this._date = date
        return this
    }


    get dayOfWeek() {
        return this._date.getUTCDay();
    }

    addDays(days: number): TimeZoneDate {
        const date = new Date(
            Date.UTC(this._year,this._month - 1,this._day + days,12)
        );

        return new TimeZoneDate(date);
    }


    static fromDateString(value: string,): TimeZoneDate {
        const parts = value.split("-");

        if (parts.length !== 3) {
            throw new Error("Invalid date format. Expected YYYY-MM-DD");
        }

        const [yearString, monthString, dayString] = parts;

        const year = Number(yearString);
        const month = Number(monthString);
        const day = Number(dayString);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(month) ||
            !Number.isInteger(day)
        ) {
            throw new Error("Invalid date");
        }

        if (month < 1 || month > 12) {
            throw new Error("Invalid month");
        }

        if (day < 1 || day > 31) {
            throw new Error("Invalid day");
        }

        return new TimeZoneDate(
            new Date(Date.UTC(year, month - 1, day, 12))
        );
    }

    get year(): number {
        return this._year;
    }

    get month(): number {
        return this._month;
    }

    get day(): number {
        return this._day;
    }

    get hour(): number {
        return this._hour;
    }

    get minute(): number {
        return this._minute;
    }

    get second(): number {
        return this._second;
    }

    get date(): Date{
        return this._date;
    }

    get secondsSinceMidnight() {
        return this.hour * 3600 +
               this.minute * 60 +
               this.second;
    }


    isSameDay(other: TimeZoneDate): boolean {
    return (
        this.year === other.year &&
        this.month === other.month &&
        this.day === other.day
    );


}
    
}