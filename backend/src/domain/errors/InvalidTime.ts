export class RangeIsNotValidError extends Error{
    constructor(){
        super("Time is not valid")
        this.name = "Time is not valid"
    }
}