import { inject, injectable } from "inversify";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import { TYPES } from "../dto/types";

@injectable()
export class DeleteUserUseCase{


    constructor(
        @inject(TYPES.UserRepository) private userRepository : UserRepository
    ){}
    async execute(id: string){
        await this.userRepository.delete(id)
    }
}