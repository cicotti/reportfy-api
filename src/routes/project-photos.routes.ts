import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as photosService from '../services/project-photos.service';
import { Type } from '@sinclair/typebox';
import { PhotoItemSchema, PhotoDeleteSchema, PhotoProjectIdParamSchema } from '../schemas/project-photos.schema';
import { IdMessageSchema, ErrorSchema } from '../schemas/common.schema';
import { checkTenant } from '../services/saas/auth.service';

export default async function photosRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId', {
    preHandler: authenticate,
    schema: {
      tags: ['project-photos'],
      description: 'Lista todas as fotos de um projeto',
      security: [{ bearerAuth: [] }],
      params: PhotoProjectIdParamSchema,
      response: {
        200: Type.Array(PhotoItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      await checkTenant(request.authToken!);
      const { projectId } = request.params as { projectId: string };
      const photos = await photosService.getProjectPhotos(request.authToken!, projectId);
      return reply.code(200).send(photos);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });

  fastify.post('/:projectId', {
    preHandler: authenticate,
    schema: {
      tags: ['project-photos'],
      description: 'Faz upload de uma foto para um projeto (multipart/form-data)',
      security: [{ bearerAuth: [] }],
      params: PhotoProjectIdParamSchema,
      consumes: ['multipart/form-data'],
      response: {
        201: PhotoItemSchema,
        500: ErrorSchema
      }
    }
  }, async (request: any, reply) => {
    try {
      await checkTenant((request as AuthenticatedRequest).authToken!);
      const { projectId } = request.params as { projectId: string };
      const data = await request.file();
      
      if (!data) {
        return reply.code(500).send({ type: 'validation', message: 'Arquivo não fornecido' });
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
      await checkTenant(request.authToken!);
      const { id } = request.body as any;
      
      // Busca a foto para obter a URL
      const allPhotos = await photosService.getProjectPhotos(request.authToken!, '');
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
