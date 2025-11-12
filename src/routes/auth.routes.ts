import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';

export default async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as { email: string; password: string };
      
      if (!email || !password) {
        return reply.code(400).send({ error: 'Email e senha são obrigatórios' });
      }

      const result = await authService.login(email, password);
      return reply.send(result);
    } catch (error: any) {
      console.error('Login error:', error);
      return reply.code(401).send({ 
        error: error.title || 'Erro ao fazer login',
        message: error.description || error.message 
      });
    }
  });

  // Signup
  fastify.post('/signup', async (request, reply) => {
    try {
      const { email, password, full_name, company } = request.body as {
        email: string;
        password: string;
        full_name: string;
        company: { name: string; document: string; telephone: string };
      };

      if (!email || !password || !full_name || !company) {
        return reply.code(400).send({ error: 'Dados incompletos' });
      }

      const result = await authService.signup(email, password, full_name, company);
      return reply.send(result);
    } catch (error: any) {
      console.error('Signup error:', error);
      return reply.code(400).send({ 
        error: error.title || 'Erro ao criar conta',
        message: error.description || error.message 
      });
    }
  });

  // Get current user
  fastify.get('/me', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const user = await authService.getCurrentUser(request.authToken!);
      
      if (!user) {
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send(user);
    } catch (error: any) {
      console.error('Get current user error:', error);
      return reply.code(500).send({ error: 'Erro ao buscar usuário' });
    }
  });

  // Reset password
  fastify.post('/reset-password', async (request, reply) => {
    try {
      const { email, redirectTo } = request.body as { email: string; redirectTo: string };

      if (!email) {
        return reply.code(400).send({ error: 'Email é obrigatório' });
      }

      await authService.resetPassword(email, redirectTo);
      return reply.send({ message: 'Email de recuperação enviado' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      return reply.code(400).send({ 
        error: error.title || 'Erro ao resetar senha',
        message: error.description || error.message 
      });
    }
  });

  // Update password
  fastify.post('/update-password', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { newPassword } = request.body as { newPassword: string };

      if (!newPassword) {
        return reply.code(400).send({ error: 'Nova senha é obrigatória' });
      }

      await authService.updatePassword(request.authToken!, newPassword);
      return reply.send({ message: 'Senha atualizada com sucesso' });
    } catch (error: any) {
      console.error('Update password error:', error);
      return reply.code(400).send({ 
        error: error.title || 'Erro ao atualizar senha',
        message: error.description || error.message 
      });
    }
  });
}
