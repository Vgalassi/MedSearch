import { injectable,inject } from "inversify";
import { User } from "../../domain/Aggregates/User";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import type { HashGenerator } from "../protocols/HashGenerator";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import { Email } from "../../domain/value-objects/Email";
import { TYPES } from "../dto/types";
import type { UseCase } from "../../domain/value-objects/UseCase";
import { PasswordIncorrectError } from "../../domain/errors/PasswordIncorrect";

type loginInput = {
  email: string;
  password: string;
};

@injectable()
export class LoginUserUseCase implements UseCase<loginInput, Promise<User>> {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.HashGenerator) private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(input: loginInput): Promise<User> {
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotfoundError("user", email.email);
    }

    const validPassword = await this.hashGenerator.compare(
      input.password,
      user.props.password,
    );

    if (!validPassword) {
      throw new PasswordIncorrectError();
    }

    return user;
  }
}