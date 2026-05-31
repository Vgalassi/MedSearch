export class Cep{
    constructor(public readonly _value: string){}

    get value(): string {
        return this._value;
    }
}
