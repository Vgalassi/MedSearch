export class InvalidArgumentError extends Error {
  constructor(argumentName: string) {
    super(`${argumentName} is invalid`);
    this.name = "InvalidArgumentError";
  }
}
