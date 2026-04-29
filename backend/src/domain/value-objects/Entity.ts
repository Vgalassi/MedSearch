import { Identifier } from "./Identifier"

export abstract class Entity<T>{
    public props: T
    public id: Identifier

    constructor(props: T, input?: Identifier){
        this.props = props
        this.id = input ?? new Identifier()
    }
}