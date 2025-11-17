import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { ApiError, UnauthorizedError } from '../lib/errors';
import { checkTenant } from '../services/saas/tenants.services';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
    company_id?: string;
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
    await checkTenant(request.authToken, request.user.id);
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else if (error instanceof UnauthorizedError) {
      throw new ApiError("authentication", error.message);
    } else {
      throw new ApiError("authentication", "Erro ao autenticar usuário");
    }
  }
}
