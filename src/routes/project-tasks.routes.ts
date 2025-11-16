import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as projectTasksService from '../services/project-tasks.service';
import { ProjectTaskItemSchema, ProjectTaskInsertSchema, ProjectTaskUpdateSchema, ProjectTaskDeleteSchema, ProjectTaskProjectIdParamSchema } from '../schemas/project-tasks.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';
import { checkTenant } from '../services/saas/tenants.services';
import { Type } from '@sinclair/typebox';

export default async function projectTasksRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId', {
    preHandler: authenticate,
    schema: {
      tags: ['project-tasks'],
      description: 'Lista todas as tarefas de um projeto',
      security: [{ bearerAuth: [] }],
      params: ProjectTaskProjectIdParamSchema,
      response: {
        200: Type.Array(ProjectTaskItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { projectId } = request.params as { projectId: string };
      const result = await projectTasksService.fetchProjectTasks(request.authToken!, projectId);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-tasks'],
      description: 'Cria uma nova tarefa de projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectTaskInsertSchema,
      response: {
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      const result = await projectTasksService.createProjectTask(request.authToken!, data);
      return reply.code(201).send({ id: result.id, message: 'Tarefa criada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-tasks'],
      description: 'Atualiza uma tarefa de projeto existente',
      security: [{ bearerAuth: [] }],
      body: ProjectTaskUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      await projectTasksService.updateProjectTask(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Tarefa atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-tasks'],
      description: 'Exclui uma tarefa de projeto',
      security: [{ bearerAuth: [] }],
      body: ProjectTaskDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      await projectTasksService.deleteProjectTask(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Tarefa excluída com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
