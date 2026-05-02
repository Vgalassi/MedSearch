export class NotfoundError extends Error{
    constructor(entity: string, identifier: string){
        super(`${entity} with identifier ${identifier} not found`)
        this.name = "NotFoundError"
    }
}