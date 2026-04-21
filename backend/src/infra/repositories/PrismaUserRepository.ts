import { prisma } from "../../lib/prisma"
import type { UserRepository } from "../../domain/repositories/UserRepository"
import { User } from "../../domain/entities/User"
import { PrismaUserMapper } from "../mappers/user-prisma"

export class PrismaUserRepository implements UserRepository{
    async create(user: User): Promise<void> {
    const baseData = {
        name: user.props.name,
        email: user.props.email,
        password: user.props.password,
        phone: user.props.phone,
        role: user.props.role
    }

    switch (user.props.role) {
        case 'PATIENT':
            await prisma.user.create({
                data: {
                    ...baseData,
                    patient: {
                        create: {
                            cpf: user.props.roleData.cpf,
                        }
                    }
                }
            })
            break

        case 'MEDIC':
            await prisma.user.create({
                data: {
                    ...baseData,
                    medic: {
                        create: {
                            crm: user.props.roleData.crm,
                            speciality: user.props.roleData.speciality
                        }
                    }
                }
            })
            break

        case 'CLINIC':
            await prisma.user.create({
                data: {
                    ...baseData,
                    clinic: {
                        create: {
                            address: user.props.roleData.address,
                            cep: user.props.roleData.cep,
                            latitude: user.props.roleData.latitude,
                            longitude: user.props.roleData.longitude,
                            description: user.props.roleData.description
                        }
                    }
                }
            })
            break
    }
}
    async getById(id: string): Promise<User | null>{
        const user = await prisma.user.findUnique({where: {id}})
        if(!user){
            return null
        }
        return PrismaUserMapper.toDomain(user)

    }
    async delete(id: string): Promise<void> {
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