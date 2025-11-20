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

export const PhotoQuerySchema = Type.Object({
  photo_id: Type.Optional(Type.String({ format: 'uuid' })),
  project_id: Type.Optional(Type.String({ format: 'uuid' }))  
});

export type PhotoQuery = Static<typeof PhotoQuerySchema>;

export const PhotoUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export type PhotoUpdateBody = Static<typeof PhotoUpdateSchema>;

export const PhotoDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type PhotoDeleteBody = Static<typeof PhotoDeleteSchema>;
