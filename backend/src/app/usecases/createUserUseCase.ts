import { injectable, inject } from "inversify"
import { TYPES } from "../dto/types"
import type { UserRepository } from "../../domain/repositories/UserRepository"
import type { UserProps } from "../../domain/entities/User";
import { User } from "../../domain/entities/User"
import type { HashGenerator } from "../protocols/HashGenerator";




@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.HashGenerator) private hashGenerator: HashGenerator

    ) { }

    async execute(data: UserProps) {

        const hashedPassword = await this.hashGenerator.hash(data.password)


        const userData: UserProps = {
            ...data,
            password: hashedPassword
        }

        const user = new User(userData)

        await this.userRepository.create(user)

        return {
            id: user.props.id!,
            name: user.props.name,
            email: user.props.email
        };
    }

}