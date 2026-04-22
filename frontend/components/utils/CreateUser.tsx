
import { UserCreateFormData } from "../types/UserFormData"
export default async function createUser(data: UserCreateFormData): Promise<string>{

    const response = await fetch('http://localhost:3000/create',{
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const resData = await response.json()

    if(response.status != 201){
        throw new Error('failed to create data')
    }
    
    return resData.message
}