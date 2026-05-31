
import { API_BASE_URL } from "../appConfig"
import { UserCreateFormData } from "../types/UserFormData"

type response = {
    status: boolean,
    message: string
}

export default async function createUser(data: UserCreateFormData): Promise<response>{

    const response = await fetch(`${API_BASE_URL}/users/register`,{
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
