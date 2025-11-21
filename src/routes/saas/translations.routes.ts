import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import * as translationsService from '../../services/saas/translations.service';
import { Type } from '@sinclair/typebox';
import { TranslationItemSchema, TranslationQuerySchema, TranslationQuery } from '../../schemas/saas/translations.schema';
import { ErrorSchema } from '../../schemas/common.schema';

export default async function translationsRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: authenticate,
    schema: {
      tags: ['translations'],
      description: 'Lista todas as traduções',
      security: [{ bearerAuth: [] }],
      querystring: TranslationQuerySchema,
      response: {
        200: Type.Array(TranslationItemSchema),
        500: ErrorSchema
      }
    }
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as TranslationQuery;
      const translations = await translationsService.fetchTranslations(request.authToken!, query);
      return reply.code(200).send(translations);
    } catch (error: any) {
      return reply.code(500).send({ type: error.type, message: error.message });
    }
  });
}
