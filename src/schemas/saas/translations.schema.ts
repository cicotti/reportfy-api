import { Type, Static } from '@sinclair/typebox';

export const TranslationItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  key: Type.String(),
  language: Type.String(),
  value: Type.String(),
  created_at: Type.String({ format: 'date-time' })
});

export type TranslationListResult = Static<typeof TranslationItemSchema>;

export const TranslationQuerySchema = Type.Object({
  translation_id: Type.Optional(Type.String({ format: 'uuid' })),
  key: Type.Optional(Type.String()),
  language: Type.Optional(Type.String())
});

export type TranslationQuery = Static<typeof TranslationQuerySchema>;
