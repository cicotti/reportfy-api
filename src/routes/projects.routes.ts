import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as projectsService from '../services/projects.service';

export default async function projectsRoutes(fastify: FastifyInstance) {
  // Get all projects
  fastify.get('/', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
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
  fastify.get('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
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
  fastify.post('/', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
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
  fastify.put('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
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
  fastify.delete('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
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
