import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import * as tenantService from '../../services/saas/tenants.services';

export default async function tenantRoutes(fastify: FastifyInstance) {
  fastify.get('/check-tenant', {
    preHandler: authenticate,
    schema: { hide: true, }
  }, async (request: AuthenticatedRequest, reply) => {
    try {      
      await tenantService.checkTenant(request.authToken!);
      return reply.code(200).send({ message: 'Tenant está ativo' });
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });
}