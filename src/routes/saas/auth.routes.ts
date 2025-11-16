import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import * as authService from '@/services/saas/auth.service';
import { LoginBodySchema, UserSessionSchema, ProfileSchema, SignupBodySchema, ResetPasswordBodySchema, UpdatePasswordBodySchema } from '@/schemas/saas/auth.schema';
import { IdMessageSchema, ErrorSchema, MessageSchema } from '@/schemas/common.schema';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/check-rsl', { preHandler: authenticate},
  async (request: AuthenticatedRequest, reply) => {
    try {
      const result = await authService.checkRsl(request.authToken!);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }    
  });  

  // Login
  fastify.post('/login', {
    schema: {
      tags: ['auth'],
      description: 'Realiza login do usuário e retorna dados da sessão',
      body: LoginBodySchema,
      response: {
        200: UserSessionSchema,
        400: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;
      const result = await authService.login(data);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });
  
  // Signup
  fastify.post('/signup', {
    schema: {
      tags: ['auth'],
      description: 'Cria uma nova conta de usuário e empresa',
      body: SignupBodySchema,
      response: {
        201: IdMessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;
      const result = await authService.signup(data);
      return reply.code(201).send({ id: result.id, message: 'Conta criada com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: authenticate,
    schema: {
      tags: ['auth'],
      description: 'Retorna os dados do usuário autenticado',
      security: [{ bearerAuth: [] }],
      response: {
        200: ProfileSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const user = await authService.getCurrentUser(request.authToken!);
      return reply.code(200).send(user);
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });

  // Reset password
  fastify.post('/reset-password', {
    schema: {
      tags: ['auth'],
      description: 'Solicita envio de email para recuperação de senha',
      body: ResetPasswordBodySchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;      
      await authService.resetPassword(data);
      return reply.code(200).send({ message: 'Email de recuperação enviado' });
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });

  // Update password
  fastify.post('/update-password', {
    preHandler: authenticate,
    schema: {
      tags: ['auth'],
      description: 'Atualiza a senha do usuário autenticado',
      security: [{ bearerAuth: [] }],
      body: UpdatePasswordBodySchema,
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      await authService.updatePassword(request.authToken!, data);
      return reply.code(200).send({ message: 'Senha atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });

  // Check Tenant
  fastify.get('/check-tenant', {
    preHandler: authenticate,
    schema: {
      tags: ['auth'],
      description: 'Verifica se o tenant está ativo',
      security: [{ bearerAuth: [] }],
      response: {
        200: MessageSchema,
        400: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {      
      await authService.checkTenant(request.authToken!);
      return reply.code(200).send({ message: 'Tenant está ativo' });
    } catch (error: any) {
      return reply.code(400).send({ type: error.type, message: error.message });
    }
  });
}