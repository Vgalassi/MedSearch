
export class AvailabilityMode {
   
    private readonly _value: string

    constructor(mode: string){
        this.validate(mode)
        this._value = mode
    }

    private validate(value: string) {
        if(value !== "OFFLINE" && value !== "ONLINE" && value !== "BOTH"){
            throw Error("invalid mode")
        }
    }

    public get value(){
        return this._value
    }    
}
