import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as weatherService from '../services/weather.service';
import { Type } from '@sinclair/typebox';
import { WeatherItemSchema, WeatherSyncSchema, WeatherProjectIdParamSchema } from '../schemas/weather.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';
import { checkTenant } from '../services/saas/auth.service';

export default async function weatherRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId', {
    preHandler: authenticate,
    schema: {
      tags: ['weather'],
      description: 'Busca informações meteorológicas de um projeto',
      security: [{ bearerAuth: [] }],
      params: WeatherProjectIdParamSchema,
      response: {
        200: Type.Array(WeatherItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { projectId } = request.params as { projectId: string };
      const weather = await weatherService.getProjectWeather(request.authToken!, projectId);
      return reply.code(200).send(weather);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/:projectId/sync', {
    preHandler: authenticate,
    schema: {
      tags: ['weather'],
      description: 'Sincroniza dados meteorológicos de um projeto a partir de coordenadas GPS',
      security: [{ bearerAuth: [] }],
      params: WeatherProjectIdParamSchema,
      body: WeatherSyncSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { projectId } = request.params as { projectId: string };
      const { latitude, longitude } = request.body as { latitude: number; longitude: number };
      
      await weatherService.syncProjectWeatherFromAPI(request.authToken!, projectId, latitude, longitude);
      return reply.code(200).send({ id: projectId, message: 'Clima sincronizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
