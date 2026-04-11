import type{ FastifyInstance } from 'fastify'


export default async function userRoutes(app: FastifyInstance){
 app.get('/users', async (req,res) => {
    return { test: 'test'}
 })
}