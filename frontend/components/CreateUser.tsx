

export default async function createUser(data: object): Promise<string>{

    const response = await fetch('http://localhost:3000/create',{
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const resData = await response.json()
    /*
    if(!response.ok){
        throw new Error('failed to post data')
    }
    */
    return resData.message
}