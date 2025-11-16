import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import * as usersService from '@/services/saas/users.service';
import { UserItemSchema, UserInsertSchema, UserUpdateSchema, UserRoleUpdateSchema, UserDeleteSchema, UserQuerySchema, UserQuery } from '@/schemas/saas/users.schema';
import { IdMessageSchema, ErrorSchema } from '@/schemas/common.schema';
import { checkTenant } from '@/services/saas/auth.service';
import { Type } from '@sinclair/typebox';

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Lista todos os usuários',
      security: [{ bearerAuth: [] }],
      querystring: UserQuerySchema,
      response: {
        200: Type.Array(UserItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const query = request.query as UserQuery;
      const result = await usersService.fetchUsers(request.authToken!, query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Cria um novo usuário',
      security: [{ bearerAuth: [] }],
      body: UserInsertSchema,
      response: {
        201: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      const result = await usersService.createUser(request.authToken!, data);
      return reply.code(201).send({ id: result.id, message: 'Usuário criado com sucesso. Email de definição de senha enviado.' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Atualiza o perfil de um usuário',
      security: [{ bearerAuth: [] }],
      body: UserUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      await usersService.updateProfile(request.authToken!, data);
      return reply.code(200).send({ id: data.id, message: 'Usuário atualizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Exclui um usuário',
      security: [{ bearerAuth: [] }],
      body: UserDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      await usersService.deleteUser(request.authToken!, data.id);
      return reply.code(200).send({ id: data.id, message: 'Usuário excluído com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.put('/role', {
    preHandler: authenticate,
    schema: {
      tags: ['users'],
      description: 'Atualiza a função/role de um usuário',
      security: [{ bearerAuth: [] }],
      body: UserRoleUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const data = request.body as any;
      await usersService.updateUserRole(request.authToken!, data);
      return reply.code(200).send({ id: data.user_id, message: 'Função atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}