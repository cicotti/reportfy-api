import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as projectInformativesService from '../services/project-informatives.service';
import { Type } from '@sinclair/typebox';
import { ProjectInformativeItemSchema, ProjectInformativeInsertSchema, ProjectInformativeUpdateSchema, ProjectInformativeDeleteSchema, 
  ProjectInformativeQuerySchema, ProjectInformativeQuery } from '../schemas/project-informatives.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';

export default async function projectInformativesRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-informatives'],
      description: 'Lista todos os informativos de um projeto',
      security: [{ bearerAuth: [] }],
      querystring: ProjectInformativeQuerySchema,
      response: {
        200: Type.Array(ProjectInformativeItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as ProjectInformativeQuery;
      const informatives = await projectInformativesService.fetchProjectInformatives(request.authToken!, query);
      return reply.code(200).send(informatives);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-informatives'],
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
      const informativeData = request.body as any;
      const result = await projectInformativesService.createProjectInformative(request.authToken!, request.user!.id, informativeData);
      return reply.code(201).send({ id: result.id, message: 'Informativo criado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-informatives'],
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
      const { id, ...informativeData } = request.body as any;
      await projectInformativesService.updateProjectInformative(request.authToken!, id, informativeData);
      return reply.code(200).send({ id, message: 'Informativo atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-informatives'],
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
      const { id } = request.body as any;
      await projectInformativesService.deleteProjectInformative(request.authToken!, id);
      return reply.code(200).send({ id, message: 'Informativo excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
