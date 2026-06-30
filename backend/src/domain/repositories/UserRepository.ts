import { User } from "../Aggregates/User"
import type { Email } from "../value-objects/Email"

export interface UserRepository {
    save(user: User): Promise<User>
    findByEmail(email: Email): Promise<User | null>
    findById(id: string): Promise<User | null >
}
