import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as clientsService from '../services/clients.service';

export default async function clientsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { company_id } = request.query as { company_id?: string };
      const clients = await clientsService.fetchClients(request.authToken!, company_id);
      return reply.send(clients);
    } catch (error: any) {
      return reply.code(500).send({ error: 'Erro ao buscar clientes' });
    }
  });

  fastify.post('/', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const clientData = request.body as any;
      await clientsService.createClient(request.authToken!, clientData);
      return reply.code(201).send({ message: 'Cliente criado com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao criar cliente' });
    }
  });

  fastify.put('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const clientData = request.body as any;
      await clientsService.updateClient(request.authToken!, id, clientData);
      return reply.send({ message: 'Cliente atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao atualizar cliente' });
    }
  });

  fastify.delete('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      await clientsService.softDeleteClient(request.authToken!, id);
      return reply.send({ message: 'Cliente excluído com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao excluir cliente' });
    }
  });
}
