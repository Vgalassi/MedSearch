import { injectable, inject} from "inversify"
import {TYPES} from "../dto/types"
import type { UserRepository } from "../../domain/repositories/UserRepository"
import type { UserProps } from "../../domain/entities/User";
import { User } from "../../domain/entities/User"
import type { HashGenerator } from "../protocols/HashGenerator";

interface CreateUserRequest extends Omit<UserProps, 'id'> {
    password: string; 
}

interface CreateUserResponse {
    id: number;
    name: string;
    email: string;
}

@injectable()
export class CreateUserUseCase{
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.HashGenerator) private hashGenerator: HashGenerator

    ) {}

    async execute(data: CreateUserRequest){
        const user = new User({
            name: data.name,
            email: data.email,
            password: await this.hashGenerator.hash(data.password),
            role: data.role
        })

        await this.userRepository.create(user)

        return {
            id: user.props.id!,
            name: user.props.name,
            email: user.props.email
        };
    }

}