import { Entity } from "./Entity";
import type { Identifier } from "./Identifier";

export abstract class AgregateRoot<T> extends Entity<T>{

    constructor(props:T, id?:Identifier){
        super(props,id)
    }
}