import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as informativeTypesService from '../services/informative-types.service';
import { Type } from '@sinclair/typebox';
import { InformativeTypeItemSchema, InformativeTypeInsertSchema, InformativeTypeUpdateSchema, InformativeTypeDeleteSchema, InformativeTypeQuerySchema } from '../schemas/informative-types.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';

export default async function informativeTypesRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informative-types'],
      description: 'Lista todos os tipos de informativos',
      security: [{ bearerAuth: [] }],
      querystring: InformativeTypeQuerySchema,
      response: {
        200: Type.Array(InformativeTypeItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { company_id } = request.query as { company_id?: string };
      const types = await informativeTypesService.fetchInformativeTypes(request.authToken!, company_id);
      return reply.code(200).send(types);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informative-types'],
      description: 'Cria um novo tipo de informativo',
      security: [{ bearerAuth: [] }],
      body: InformativeTypeInsertSchema,
      response: {
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const typeData = request.body as any;
      const result = await informativeTypesService.createInformativeType(request.authToken!, typeData);
      return reply.code(201).send({ id: result.id, message: 'Tipo de informativo criado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informative-types'],
      description: 'Atualiza um tipo de informativo',
      security: [{ bearerAuth: [] }],
      body: InformativeTypeUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id, ...typeData } = request.body as any;
      await informativeTypesService.updateInformativeType(request.authToken!, id, typeData);
      return reply.code(200).send({ id, message: 'Tipo de informativo atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informative-types'],
      description: 'Exclui um tipo de informativo',
      security: [{ bearerAuth: [] }],
      body: InformativeTypeDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.body as any;
      await informativeTypesService.deleteInformativeType(request.authToken!, id);
      return reply.code(200).send({ id, message: 'Tipo de informativo excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
