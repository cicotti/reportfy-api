import { Type, Static } from '@sinclair/typebox';

export const PhotoItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  photo_url: Type.String({ format: 'uri' }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  display_order: Type.Number(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export type PhotoListResult = Static<typeof PhotoItemSchema>;

export const PhotoDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type PhotoDeleteBody = Static<typeof PhotoDeleteSchema>;

export const PhotoProjectIdParamSchema = Type.Object({
  projectId: Type.String({ format: 'uuid' })
});

export type PhotoProjectIdParam = Static<typeof PhotoProjectIdParamSchema>;
