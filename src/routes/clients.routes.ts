import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as clientsService from '../services/clients.service';
import { Type } from '@sinclair/typebox';
import {
  ClientSchema,
  ClientInsertSchema,
  ClientUpdateSchema,
  ClientQuerySchema,
  IdParamSchema,
  ErrorSchema,
  MessageSchema
} from '../schemas/common.schemas';

export default async function clientsRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Lista todos os clientes, opcionalmente filtrados por empresa',
      security: [{ bearerAuth: [] }],
      querystring: ClientQuerySchema,
      response: {
        200: Type.Array(ClientSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { company_id } = request.query as { company_id?: string };
      const clients = await clientsService.fetchClients(request.authToken!, company_id);
      return reply.send(clients);
    } catch (error: any) {
      return reply.code(500).send({ error: 'Erro ao buscar clientes' });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Cria um novo cliente',
      security: [{ bearerAuth: [] }],
      body: ClientInsertSchema,
      response: {
        201: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const clientData = request.body as any;
      await clientsService.createClient(request.authToken!, clientData);
      return reply.code(201).send({ message: 'Cliente criado com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao criar cliente' });
    }
  });

  fastify.put('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Atualiza um cliente existente',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      body: ClientUpdateSchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const clientData = request.body as any;
      await clientsService.updateClient(request.authToken!, id, clientData);
      return reply.send({ message: 'Cliente atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao atualizar cliente' });
    }
  });

  fastify.delete('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Exclui um cliente (soft delete)',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      await clientsService.softDeleteClient(request.authToken!, id);
      return reply.send({ message: 'Cliente excluído com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao excluir cliente' });
    }
  });
}
