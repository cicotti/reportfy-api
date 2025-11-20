import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { ApiError, UnauthorizedError } from '../lib/errors';
import { checkTenant } from '../services/saas/tenants.services';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
  };
  authToken?: string;
}

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticação não fornecido');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verifica o token usando Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new UnauthorizedError('Token inválido ou expirado');
    }

    // Anexa o usuário e token à requisição
    request.user = {
      id: user.id,
      email: user.email!,
    };
    request.authToken = token;

    // Verifica se o tenant está ativo
    await checkTenant(token, user.id);
    
  } catch (error) {
    if (error instanceof ApiError) {
      return reply.code(403).send({ type: error.type, message: error.message });
    }
    if (error instanceof UnauthorizedError) {
      return reply.code(401).send({ type: "authentication", message: error.message });
    }
    return reply.code(500).send({ type: "critical", message: "Erro inesperado ao autenticar usuário" });
  }
}
