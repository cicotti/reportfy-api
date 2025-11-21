import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authenticateSSE, AuthenticatedRequest } from '../middleware/auth';
import { createAuthenticatedClient } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeParams {
  table: string;
}

interface RealtimeQuerystring {
  token?: string;
}

export default async function realtimeRoutes(fastify: FastifyInstance) {
  
  // SSE endpoint para mudanças em tempo real de uma tabela
  fastify.get<{ Params: RealtimeParams; Querystring: RealtimeQuerystring }>('/subscribe/:table', {
    preHandler: authenticateSSE,
    schema: {
      tags: ['realtime'],
      description: 'Subscreve em mudanças em tempo real de uma tabela via SSE. EventSource não suporta headers, então o token deve ser enviado via query parameter.',
      params: {
        type: 'object',
        properties: {
          table: { 
            type: 'string',
            enum: ['projects', 'project_tasks', 'project_photos', 'project_weathers', 'project_informatives'],
            description: 'Nome da tabela para monitorar mudanças'
          }
        },
        required: ['table']
      },
      querystring: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Token JWT de autenticação (Bearer token sem o prefixo "Bearer ")'
          }
        },
        required: ['token']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { table } = request.params as RealtimeParams;
    
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const client = createAuthenticatedClient(request.authToken!);
    let channel: RealtimeChannel;

    const sendEvent = (event: string, data: any) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Criar subscription para a tabela
      channel = client
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: table 
          },
          (payload) => {
            // Formato esperado pelo frontend
            sendEvent('database_change', {
              type: payload.eventType, // INSERT, UPDATE, DELETE
              table: payload.table,
              schema: 'public',
              new: payload.new,
              old: payload.old
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            sendEvent('connected', { 
              message: `Conectado ao canal ${table}`,
              timestamp: new Date().toISOString()
            });
          } else if (status === 'CHANNEL_ERROR') {
            sendEvent('error', { 
              message: 'Erro ao conectar ao canal',
              timestamp: new Date().toISOString()
            });
          }
        });

      // Enviar heartbeat a cada 30 segundos (comentário SSE para manter conexão viva)
      const heartbeatInterval = setInterval(() => {
        reply.raw.write(': heartbeat\n\n');
      }, 30000);

      // Cleanup quando a conexão for fechada
      request.raw.on('close', () => {
        clearInterval(heartbeatInterval);
        if (channel) {
          client.removeChannel(channel);
        }
        reply.raw.end();
      });

    } catch (error: any) {
      sendEvent('error', { 
        message: error.message || 'Erro inesperado',
        timestamp: new Date().toISOString()
      });
      reply.raw.end();
    }
  });

  // SSE endpoint para auth state changes
  fastify.get<{ Querystring: RealtimeQuerystring }>('/auth-state', {
    preHandler: authenticateSSE,
    schema: {
      tags: ['realtime'],
      description: 'Monitora mudanças de estado de autenticação via SSE. Envia eventos quando: usuário faz logout, token expira, perfil é atualizado, ou empresa é desativada.',
      querystring: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Token JWT de autenticação'
          }
        },
        required: ['token']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const client = createAuthenticatedClient(request.authToken!);
    let authChannel: RealtimeChannel;

    const sendEvent = (event: string, data: any) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Enviar evento inicial de conexão
      sendEvent('connected', { 
        message: 'Conectado ao monitor de autenticação',
        timestamp: new Date().toISOString()
      });

      // Monitorar auth state changes do Supabase
      const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
        sendEvent('auth_change', {
          event, // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, etc.
          session: session ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            expires_in: session.expires_in,
            user: {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role,
              user_metadata: session.user.user_metadata,
              app_metadata: session.user.app_metadata
            }
          } : null
        });
      });

      // Monitorar mudanças na tabela de usuários (perfil atualizado)
      authChannel = client
        .channel('user_profile_changes')
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'users',
            filter: `id=eq.${request.user!.id}`
          },
          (payload) => {
            sendEvent('auth_change', {
              event: 'USER_UPDATED',
              session: {
                user: payload.new
              }
            });
          }
        )
        .subscribe();

      // Monitorar mudanças na empresa do usuário
      authChannel.on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'companies'
        },
        (payload) => {
          // Se a empresa foi desativada
          if (payload.new && !payload.new.is_active && payload.old && payload.old.is_active) {
            sendEvent('auth_change', {
              event: 'COMPANY_DEACTIVATED',
              session: null
            });
          }
        }
      );

      // Heartbeat a cada 30 segundos (comentário SSE para manter conexão viva)
      const heartbeatInterval = setInterval(() => {
        reply.raw.write(': heartbeat\n\n');
      }, 30000);

      // Cleanup quando a conexão for fechada
      request.raw.on('close', () => {
        clearInterval(heartbeatInterval);
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe();
        }
        if (authChannel) {
          client.removeChannel(authChannel);
        }
        reply.raw.end();
      });

    } catch (error: any) {
      sendEvent('error', { 
        message: error.message || 'Erro inesperado',
        timestamp: new Date().toISOString()
      });
      reply.raw.end();
    }
  });

  // Health check do realtime
  fastify.get('/health', {
    schema: {
      tags: ['realtime'],
      description: 'Verifica o status do serviço realtime',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return reply.code(200).send({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });
}
