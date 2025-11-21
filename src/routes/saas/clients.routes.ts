import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import * as clientsService from '../../services/saas/clients.service';
import { ClientItemSchema, ClientInsertSchema, ClientUpdateSchema, ClientDeleteSchema, ClientQuerySchema, ClientQuery } from '../../schemas/saas/clients.schema';
import { IdMessageSchema, ErrorSchema } from '../../schemas/common.schema';
import { Type } from '@sinclair/typebox';

export default async function clientsRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Lista todos os clientes',
      security: [{ bearerAuth: [] }],
      querystring: ClientQuerySchema,
      response: {
        200: Type.Array(ClientItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as ClientQuery;
      const result = await clientsService.fetchClients(request.authToken!, query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
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
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      const result = await clientsService.createClient(request.authToken!, request.user!.id, data);
      return reply.code(201).send({ id: result.id, message: 'Cliente criado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Atualiza um cliente existente',
      security: [{ bearerAuth: [] }],
      body: ClientUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      await clientsService.updateClient(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Cliente atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['clients'],
      description: 'Exclui um cliente',
      security: [{ bearerAuth: [] }],
      body: ClientDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      await clientsService.deleteClient(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Cliente excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
