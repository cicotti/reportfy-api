import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import * as authService from '../../services/saas/auth.service';
import { LoginBodySchema, UserSessionSchema, SignupBodySchema, ResetPasswordBodySchema, UpdatePasswordBodySchema, RefreshTokenBodySchema, TokenValiditySchema } from '../../schemas/saas/auth.schema';
import { IdMessageSchema, ErrorSchema, MessageSchema } from '../../schemas/common.schema';

export default async function authRoutes(fastify: FastifyInstance) {

  // Login
  fastify.post('/login', {
    schema: {
      tags: ['auth'],
      description: 'Realiza login do usuário e retorna dados da sessão',
      body: LoginBodySchema,
      response: {
        200: UserSessionSchema,
        500: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;
      const result = await authService.login(data);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
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
        500: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;
      const result = await authService.signup(data);
      return reply.code(201).send({ id: result.id, message: 'Conta criada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
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
        500: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;      
      await authService.resetPassword(data);
      return reply.code(200).send({ message: 'Email de recuperação enviado' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
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
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as any;
      await authService.updatePassword(request.authToken!, data);
      return reply.code(200).send({ message: 'Senha atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  // Refresh token
  fastify.post('/refresh-token', {
    schema: {
      tags: ['auth'],
      description: 'Renova o access token usando o refresh token',
      body: RefreshTokenBodySchema,
      response: {
        200: UserSessionSchema,
        500: ErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;
      const result = await authService.refreshToken(data);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  // Verify token
  fastify.get('/verify-token', {
    preHandler: authenticate,
    schema: {
      tags: ['auth'],
      description: 'Verifica a validade do access token',
      security: [{ bearerAuth: [] }],
      response: {
        200: TokenValiditySchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const result = await authService.verifyToken(request.authToken!);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  // Logout
  fastify.post('/logout', {
    preHandler: authenticate,
    schema: {
      tags: ['auth'],
      description: 'Realiza logout do usuário e invalida o token',
      security: [{ bearerAuth: [] }],
      response: {
        200: MessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await authService.logout(request.authToken!);
      return reply.code(200).send({ message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}