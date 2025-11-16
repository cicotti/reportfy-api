import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import * as projectsService from '@/services/projects.service';
import { Type } from '@sinclair/typebox';
import { ProjectWithClientSchema, ProjectInsertSchema, ProjectUpdateSchema, ProjectQuerySchema } from '@/schemas/common.schema';
import { IdMessageSchema, ErrorSchema, MessageSchema } from '@/schemas/common.schema';

export default async function projectsRoutes(fastify: FastifyInstance) {
  // Get all projects
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Lista todos os projetos, opcionalmente filtrados por cliente',
      security: [{ bearerAuth: [] }],
      querystring: ProjectQuerySchema,
      response: {
        200: Type.Array(ProjectWithClientSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { client_id } = request.query as { client_id?: string };
      const projects = await projectsService.fetchProjects(request.authToken!, client_id);
      return reply.send(projects);
    } catch (error: any) {
      console.error('Fetch projects error:', error);
      return reply.code(500).send({ error: 'Erro ao buscar projetos' });
    }
  });

  // Get project by ID
  fastify.get('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Busca um projeto específico por ID',
      security: [{ bearerAuth: [] }],
      params: IdMessageSchema,
      response: {
        200: ProjectWithClientSchema,
        404: ErrorSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const project = await projectsService.fetchProject(request.authToken!, id);
      
      if (!project) {
        return reply.code(404).send({ error: 'Projeto não encontrado' });
      }

      return reply.send(project);
    } catch (error: any) {
      console.error('Fetch project error:', error);
      return reply.code(500).send({ error: 'Erro ao buscar projeto' });
    }
  });

  // Create project
  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Cria um novo projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectInsertSchema,
      response: {
        201: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const projectData = request.body as any;
      await projectsService.createProject(request.authToken!, projectData);
      return reply.code(201).send({ message: 'Projeto criado com sucesso' });
    } catch (error: any) {
      console.error('Create project error:', error);
      return reply.code(400).send({ error: 'Erro ao criar projeto' });
    }
  });

  // Update project
  fastify.put('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Atualiza um projeto existente',
      security: [{ bearerAuth: [] }],
      params: IdMessageSchema,
      body: ProjectUpdateSchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const projectData = request.body as any;
      await projectsService.updateProject(request.authToken!, id, projectData);
      return reply.send({ message: 'Projeto atualizado com sucesso' });
    } catch (error: any) {
      console.error('Update project error:', error);
      return reply.code(400).send({ error: 'Erro ao atualizar projeto' });
    }
  });

  // Delete project (soft delete)
  fastify.delete('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['projects'],
      description: 'Exclui um projeto (soft delete)',
      security: [{ bearerAuth: [] }],
      params: IdMessageSchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      await projectsService.softDeleteProject(request.authToken!, id);
      return reply.send({ message: 'Projeto excluído com sucesso' });
    } catch (error: any) {
      console.error('Delete project error:', error);
      return reply.code(400).send({ error: 'Erro ao excluir projeto' });
    }
  });
}
