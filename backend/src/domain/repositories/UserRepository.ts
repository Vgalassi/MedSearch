

export interface UserRepository {
    saveUser(user: User): Promise<void>
    getUser():
    deleteUser():
    editUser():
}