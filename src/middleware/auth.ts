import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '@/lib/supabase';
import { UnauthorizedError } from '@/lib/errors';

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
    
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      reply.code(401).send({ error: error.message });
    } else {
      reply.code(500).send({ error: 'Erro ao autenticar' });
    }
  }
}
