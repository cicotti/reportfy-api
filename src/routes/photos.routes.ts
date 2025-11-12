import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as photosService from '../services/photos.service';

export default async function photosRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const photos = await photosService.getProjectPhotos(request.authToken!, projectId);
      return reply.send(photos);
    } catch (error: any) {
      return reply.code(500).send({ error: 'Erro ao buscar fotos' });
    }
  });

  fastify.post('/:projectId', { preHandler: authenticate }, async (request: any, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({ error: 'Arquivo não fornecido' });
      }

      const buffer = await data.toBuffer();
      const fields: any = data.fields;
      const description = fields?.description?.value as string | undefined;

      const photo = await photosService.uploadProjectPhoto(
        (request as AuthenticatedRequest).authToken!,
        projectId,
        buffer,
        data.filename,
        description
      );

      return reply.code(201).send(photo);
    } catch (error: any) {
      console.error('Upload photo error:', error);
      return reply.code(400).send({ error: 'Erro ao fazer upload da foto' });
    }
  });

  fastify.delete('/:id', { preHandler: authenticate }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      // Primeiro busca a foto para ter as informações necessárias
      const photos = await photosService.getProjectPhotos(request.authToken!, '');
      const photo = photos.find(p => p.id === id);
      
      if (!photo) {
        return reply.code(404).send({ error: 'Foto não encontrada' });
      }

      await photosService.deleteProjectPhoto(request.authToken!, photo);
      return reply.send({ message: 'Foto excluída com sucesso' });
    } catch (error: any) {
      return reply.code(400).send({ error: 'Erro ao excluir foto' });
    }
  });
}
