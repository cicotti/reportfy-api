import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as weatherService from '../services/project-weathers.service';
import { Type } from '@sinclair/typebox';
import { WeatherItemSchema, WeatherSyncSchema, WeatherQuerySchema, WeatherQuery, WeatherSyncBody } from '../schemas/project-weathers.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';

export default async function projectWeathersRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-weathers'],
      description: 'Busca informações meteorológicas de um projeto',
      security: [{ bearerAuth: [] }],
      querystring: WeatherQuerySchema,
      response: {
        200: Type.Array(WeatherItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as WeatherQuery;
      const result = await weatherService.getProjectWeather(request.authToken!, query);
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/sync', {
    preHandler: authenticate,
    schema: {
      tags: ['project-weathers'],
      description: 'Sincroniza dados meteorológicos de um projeto a partir de coordenadas GPS',
      security: [{ bearerAuth: [] }],
      body: WeatherSyncSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const data = request.body as WeatherSyncBody;
      await weatherService.syncProjectWeatherFromAPI(request.authToken!, request.user!.id, data);
      return reply.code(200).send({ id: data.project_id, message: 'Clima sincronizado com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
