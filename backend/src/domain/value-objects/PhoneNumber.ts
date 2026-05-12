import { InvalidArgumentError } from "../errors/InvalidArgumentError";

export class PhoneNumber {
  private readonly _value: string;

  constructor(phone: string) {
    const normalizedPhone = this.normalize(phone);

    this.validate(normalizedPhone);

    this._value = normalizedPhone;
  }

  public get value(): string {
    return this._value;
  }

  private normalize(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  private validate(phone: string): void {

    const validLengths = [10, 11, 12, 13];

    if (!validLengths.includes(phone.length)) {
      throw new InvalidArgumentError("phone")
    }

    if (!/^\d+$/.test(phone)) {
      throw new InvalidArgumentError("phone");
    }
  }
}