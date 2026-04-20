import { prisma } from "../../lib/prisma"
import type { UserRepository } from "../../domain/repositories/UserRepository"
import { User } from "../../domain/entities/User"
import { PrismaUserMapper } from "../mappers/user-prisma"

export class PrismaUserRepository implements UserRepository{
    async create(user: User): Promise<void>{
        await prisma.user.create({
            data: {
                name: user.props.name,
                email: user.props.email,
                password: user.props.password,
                role: user.props.role
            }
        })
    }
    async getById(id: number): Promise<User | null>{
        const user = await prisma.user.findUnique({where: {id}})
        if(!user){
            return null
        }
        return PrismaUserMapper.toDomain(user)

    }
    async delete(id: number): Promise<void> {
        await prisma.user.delete({where: {id}})
    }
    async update(user: User): Promise<User>{
        if(!user.props.id){
            throw new Error("id required")
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: user.props.id
            },
            data: {
                name: user.props.name,
                password: user.props.password,
                email: user.props.email,
            }
        })

        return PrismaUserMapper.toDomain(updatedUser)
    }
    



}