import { User } from "../Aggregates/User"

export interface UserRepository {
    save(user: User): Promise<User>
    findByEmail(email: string): Promise<User | null>
}