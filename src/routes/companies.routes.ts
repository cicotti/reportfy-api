import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as companiesService from '../services/companies.service';
import { CompanyItemSchema, CompanyInsertSchema, CompanyUpdateSchema } from '../schemas/companies.schema';
import { IdParamSchema, IdMessageSchema, ErrorSchema } from '../schemas/common.schemas';
import { checkTenant } from '../services/auth.service';
import { Type } from '@sinclair/typebox';

export default async function companiesRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Lista todas as empresas',
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Array(CompanyItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const companies = await companiesService.fetchCompanies(request.authToken!);
      return reply.code(200).send(companies);
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
      await checkTenant(request.authToken!);
      const companyData = request.body as any;
      var result = await companiesService.createCompany(request.authToken!, companyData);
      return reply.code(201).send({ id: result.id, message: 'Empresa criada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Atualiza uma empresa existente',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      body: CompanyUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { id } = request.params as { id: string };
      const companyData = request.body as any;
      await companiesService.updateCompany(request.authToken!, id, companyData);
      return reply.code(200).send({ id, message: 'Empresa atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['companies'],
      description: 'Exclui uma empresa',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { id } = request.params as { id: string };
      await companiesService.deleteCompany(request.authToken!, id);
      return reply.code(200).send({ id, message: 'Empresa excluída com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
