import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as toolsService from '../services/tools.service';


export default async function toolsRoutes(fastify: FastifyInstance) {  
  fastify.get('/check-rsl', { 
    preHandler: authenticate,
    schema: { hide: true }
  },
  async (request: AuthenticatedRequest, reply) => {
    try {
      const result = await toolsService.checkRsl(request.authToken!);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });
}