import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import * as companiesService from '../../services/saas/companies.service';
import { CompanyItemSchema, CompanyInsertSchema, CompanyUpdateSchema, CompanyDeleteSchema, CompanyQuerySchema, CompanyQuery } from '../../schemas/saas/companies.schema';
import { IdMessageSchema, ErrorSchema } from '../../schemas/common.schema';
import { Type } from '@sinclair/typebox';

export default async function companiesRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Lista todas as empresas',
      security: [{ bearerAuth: [] }],
      querystring: CompanyQuerySchema,
      response: {
        200: Type.Array(CompanyItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as CompanyQuery;
      const result = await companiesService.fetchCompanies(request.authToken!, query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Cria uma nova empresa',
      security: [{ bearerAuth: [] }],
      body: CompanyInsertSchema,
      response: {
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      var result = await companiesService.createCompany(request.authToken!, request.user!.id, data);
      return reply.code(201).send({ id: result.id, message: 'Empresa criada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Atualiza uma empresa existente',
      security: [{ bearerAuth: [] }],
      body: CompanyUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      await companiesService.updateCompany(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Empresa atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Exclui uma empresa',
      security: [{ bearerAuth: [] }],
      body: CompanyDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      await companiesService.deleteCompany(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Empresa excluída com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
