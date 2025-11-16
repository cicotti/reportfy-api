/*import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as informativesService from '../services/informatives.service';
import { Type } from '@sinclair/typebox';
import { InformativeTypeItemSchema, InformativeTypeInsertSchema, InformativeTypeUpdateSchema, InformativeTypeDeleteSchema, InformativeTypeQuerySchema,
  ProjectInformativeItemSchema, ProjectInformativeInsertSchema, ProjectInformativeUpdateSchema, ProjectInformativeDeleteSchema, ProjectInformativeProjectIdParamSchema
} from '../schemas/informatives.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';
import { checkTenant } from '../services/saas/auth.service';

export default async function informativesRoutes(fastify: FastifyInstance) {
  // ===== Informative Types Routes =====
  
  fastify.get('/types', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
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
      await checkTenant(request.authToken!);
      const { company_id } = request.query as { company_id?: string };
      const types = await informativesService.fetchInformativeTypes(request.authToken!, company_id);
      return reply.code(200).send(types);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/types', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
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
      await checkTenant(request.authToken!);
      const typeData = request.body as any;
      const result = await informativesService.createInformativeType(request.authToken!, typeData);
      return reply.code(201).send({ id: result.id, message: 'Tipo de informativo criado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/types', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
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
      await checkTenant(request.authToken!);
      const { id, ...typeData } = request.body as any;
      await informativesService.updateInformativeType(request.authToken!, id, typeData);
      return reply.code(200).send({ id, message: 'Tipo de informativo atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/types', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
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
      await checkTenant(request.authToken!);
      const { id } = request.body as any;
      await informativesService.deleteInformativeType(request.authToken!, id);
      return reply.code(200).send({ id, message: 'Tipo de informativo excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  // ===== Project Informatives Routes =====

  fastify.get('/:projectId', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
      description: 'Lista todos os informativos de um projeto',
      security: [{ bearerAuth: [] }],
      params: ProjectInformativeProjectIdParamSchema,
      response: {
        200: Type.Array(ProjectInformativeItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { projectId } = request.params as { projectId: string };
      const informatives = await informativesService.fetchProjectInformatives(request.authToken!, projectId);
      return reply.code(200).send(informatives);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
      description: 'Cria um novo informativo para um projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectInformativeInsertSchema,
      response: {
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const informativeData = request.body as any;
      const result = await informativesService.createProjectInformative(request.authToken!, informativeData);
      return reply.code(201).send({ id: result.id, message: 'Informativo criado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
      description: 'Atualiza um informativo de projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectInformativeUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { id, ...informativeData } = request.body as any;
      await informativesService.updateProjectInformative(request.authToken!, id, informativeData);
      return reply.code(200).send({ id, message: 'Informativo atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['informatives'],
      description: 'Exclui um informativo de projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectInformativeDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { id } = request.body as any;
      await informativesService.deleteProjectInformative(request.authToken!, id);
      return reply.code(200).send({ id, message: 'Informativo excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
*/