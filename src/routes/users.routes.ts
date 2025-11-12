import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as usersService from '../services/users.service';
import { Type } from '@sinclair/typebox';
import {
  UserSchema,
  UserProfileUpdateSchema,
  UserRoleSchema,
  ClientQuerySchema,
  IdParamSchema,
  ErrorSchema,
  MessageSchema
} from '../schemas/common.schemas';

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Lista todos os usuários, opcionalmente filtrados por empresa',
      security: [{ bearerAuth: [] }],
      querystring: ClientQuerySchema,
      response: {
        200: Type.Array(UserSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { company_id } = request.query as { company_id?: string };
      const users = await usersService.fetchUsers(request.authToken!, company_id);
      return reply.send(users);
    } catch (error: any) {
      return reply.code(500).send({ error: 'Erro ao buscar usuários' });
    }
  });

  fastify.put('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Atualiza o perfil de um usuário',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      body: UserProfileUpdateSchema,
      response: {
        200: UserSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userData = request.body as any;
      const user = await usersService.updateProfile(request.authToken!, id, userData);
      return reply.send(user);
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao atualizar usuário' });
    }
  });

  fastify.delete('/:id', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Exclui um usuário',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      await usersService.deleteUser(request.authToken!, id);
      return reply.send({ message: 'Usuário excluído com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao excluir usuário' });
    }
  });

  fastify.post('/:id/role', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Atualiza a função/role de um usuário',
      security: [{ bearerAuth: [] }],
      params: IdParamSchema,
      body: UserRoleSchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { role } = request.body as { role: 'admin' | 'user' | 'super_user' };
      await usersService.upsertUserRole(request.authToken!, id, role);
      return reply.send({ message: 'Função atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao atualizar função' });
    }
  });
}
