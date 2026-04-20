import { User } from "../entities/User"

export interface UserRepository {
    create(user: User): Promise<void>
    getById(id: number): Promise<User | null>
    delete(id: number): Promise<void>
    update(user: User): Promise<User>
}