export class RangeIsNotValidError extends Error{
    constructor(){
        super("Day range is not valid")
        this.name = "Day range is not valid"
    }
}