import { User } from "../entities/User"

export interface UserRepository {
    create(user: User): Promise<void>
    getById(id: string): Promise<User | null>
    delete(id: string): Promise<void>
    update(user: User): Promise<User>
}