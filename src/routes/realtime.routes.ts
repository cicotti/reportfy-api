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
            sendEvent('database_change', {
              type: payload.eventType,
              table: payload.table,
              data: payload.new,
              old: payload.old,
              timestamp: new Date().toISOString()
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

      // Enviar heartbeat a cada 30 segundos
      const heartbeatInterval = setInterval(() => {
        sendEvent('heartbeat', { 
          timestamp: new Date().toISOString() 
        });
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
  fastify.get('/auth-state', {
    schema: {
      tags: ['realtime'],
      description: 'Monitora mudanças de estado de autenticação via SSE',
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendEvent = (event: string, data: any) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Enviar evento inicial
    sendEvent('connected', { 
      message: 'Conectado ao monitor de autenticação',
      timestamp: new Date().toISOString()
    });

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      sendEvent('heartbeat', { 
        timestamp: new Date().toISOString() 
      });
    }, 30000);

    // Cleanup
    request.raw.on('close', () => {
      clearInterval(heartbeatInterval);
      reply.raw.end();
    });
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
