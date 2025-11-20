import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as photosService from '../services/project-photos.service';
import { Type } from '@sinclair/typebox';
import { PhotoItemSchema, PhotoDeleteSchema, PhotoQuerySchema, PhotoUpdateSchema, PhotoQuery } from '../schemas/project-photos.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';

export default async function photosRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-photos'],
      description: 'Lista todas as fotos de um projeto',
      security: [{ bearerAuth: [] }],
      querystring: PhotoQuerySchema,
      response: {
        200: Type.Array(PhotoItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as PhotoQuery;
      const photos = await photosService.getProjectPhotos(request.authToken!, query);
      return reply.code(200).send(photos);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-photos'],
      description: 'Faz upload de uma foto para um projeto (multipart/form-data). Campos: project_id (obrigatório, UUID), description (opcional, string), file (obrigatório, imagem)',
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
      response: {
        201: PhotoItemSchema,
        500: ErrorSchema
      }
    }
  }, async (request: any, reply) => {
    try {
      const data = await request.file();
      const photo = await photosService.uploadProjectPhoto(request.authToken!, request.user!.id, data);
      return reply.code(201).send(photo);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type || "critical", message: error.message });
    }
  });

  fastify.put('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-photos'],
      description: 'Atualiza a descrição de uma foto',
      security: [{ bearerAuth: [] }],
      body: PhotoUpdateSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id, ...photoData } = request.body as any;
      await photosService.updateProjectPhoto(request.authToken!, id, photoData);
      return reply.code(200).send({ id, message: 'Descrição da foto atualizada com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.delete('/', {
    preHandler: authenticate,
    schema: {
      tags: ['project-photos'],
      description: 'Exclui uma foto',
      security: [{ bearerAuth: [] }],
      body: PhotoDeleteSchema,
      response: {
        200: IdMessageSchema,
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.body as any;
      
      // Busca a foto para obter a URL
      const allPhotos = await photosService.getProjectPhotos(request.authToken!);
      const photo = allPhotos.find(p => p.id === id);
      
      if (!photo) {
        return reply.code(500).send({ type: 'validation', message: 'Foto não encontrada' });
      }

      await photosService.deleteProjectPhoto(request.authToken!, photo.id, photo.photo_url);
      return reply.code(200).send({ id, message: 'Foto excluída com sucesso' });
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
