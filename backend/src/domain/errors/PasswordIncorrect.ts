export class PasswordIncorrectError extends Error {
  constructor() {
    super(
      `Password is incorrect`,
    );
    this.name = "PasswordIncorrectError";
  }
}
