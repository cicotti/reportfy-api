import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as projectsService from '../services/projects.service';
import { ProjectItemSchema, ProjectInsertSchema, ProjectUpdateSchema, ProjectDeleteSchema, ProjectQuerySchema, ProjectQuery } from '../schemas/projects.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';
import { Type } from '@sinclair/typebox';

export default async function projectsRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Lista todos os projetos',
      security: [{ bearerAuth: [] }],
      querystring: ProjectQuerySchema,
      response: {
        200: Type.Array(ProjectItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as ProjectQuery;
      const result = await projectsService.fetchProjects(request.authToken!, query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Cria um novo projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectInsertSchema,
      response: {
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const projectData = request.body as any;
      const result = await projectsService.createProject(request.authToken!, projectData);
      return reply.code(201).send({ id: result.id, message: 'Projeto criado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Atualiza um projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id, ...projectData } = request.body as any;
      await projectsService.updateProject(request.authToken!, id, projectData);
      return reply.code(200).send({ id, message: 'Projeto atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Exclui um projeto (soft delete)',
      security: [{ bearerAuth: [] }],
      body: ProjectDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.body as any;
      await projectsService.deleteProject(request.authToken!, id);
      return reply.code(200).send({ id, message: 'Projeto excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
