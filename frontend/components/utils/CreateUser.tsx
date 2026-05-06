
type response = {
    status: boolean,
    message: string
}
import { UserCreateFormData } from "../types/UserFormData"
export default async function createUser(data: UserCreateFormData): Promise<response>{

    const response = await fetch('http://localhost:3000/users/register',{
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const resData = await response.json()

    if(response.status != 201){
        return {status: false, message: resData.message}
    }
    
    return {status: true, message: resData.message}
}