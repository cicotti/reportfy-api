import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as companiesService from '../services/companies.service';

export default async function companiesRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const companies = await companiesService.fetchCompanies(request.authToken!);
      return reply.send(companies);
    } catch (error: any) {
      return reply.code(500).send({ error: 'Erro ao buscar empresas' });
    }
  });

  fastify.post('/', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const companyData = request.body as any;
      await companiesService.createCompany(request.authToken!, companyData);
      return reply.code(201).send({ message: 'Empresa criada com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao criar empresa' });
    }
  });

  fastify.put('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const companyData = request.body as any;
      await companiesService.updateCompany(request.authToken!, id, companyData);
      return reply.send({ message: 'Empresa atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao atualizar empresa' });
    }
  });

  fastify.delete('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      await companiesService.deleteCompany(request.authToken!, id);
      return reply.send({ message: 'Empresa excluída com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao excluir empresa' });
    }
  });
}
