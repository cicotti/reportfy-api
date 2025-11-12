import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as weatherService from '../services/weather.service';

export default async function weatherRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const weather = await weatherService.getProjectWeather(request.authToken!, projectId);
      return reply.send(weather);
    } catch (error: any) {
      return reply.code(500).send({ error: 'Erro ao buscar clima' });
    }
  });

  fastify.post('/:projectId/sync', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const { latitude, longitude } = request.body as { latitude: number; longitude: number };
      
      if (!latitude || !longitude) {
        return reply.code(400).send({ error: 'Latitude e longitude são obrigatórias' });
      }

      await weatherService.syncProjectWeatherFromAPI(request.authToken!, projectId, latitude, longitude);
      return reply.send({ message: 'Clima sincronizado com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao sincronizar clima' });
    }
  });
}
