import {injectable } from "inversify"
import {hash,compare} from "bcryptjs"
import type { HashGenerator } from "../../app/protocols/HashGenerator"

@injectable()
export class BcryptAdapter implements HashGenerator {
    private readonly salt = 8
    async hash(plain: string): Promise<string>{
        return hash(plain,this.salt)
    }

    async compare(plain: string, hashed: string): Promise<boolean>{
        return compare(plain,hashed)
    }
}