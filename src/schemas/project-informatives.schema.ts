import { Type, Static } from '@sinclair/typebox';

export const ProjectInformativeItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  informative_type_id: Type.String({ format: 'uuid' }),
  content: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export type ProjectInformativeListResult = Static<typeof ProjectInformativeItemSchema>;

export const ProjectInformativeQuerySchema = Type.Object({
  informative_id: Type.Optional(Type.String({ format: 'uuid' })),
  project_id: Type.Optional(Type.String({ format: 'uuid' })),
});

export type ProjectInformativeQuery = Static<typeof ProjectInformativeQuerySchema>;

export const ProjectInformativeInsertSchema = Type.Object({
  project_id: Type.String({ format: 'uuid' }),
  informative_type_id: Type.String({ format: 'uuid' }),
  content: Type.Optional(Type.String())
});

export type ProjectInformativeInsertBody = Static<typeof ProjectInformativeInsertSchema>;

export const ProjectInformativeUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  content: Type.Optional(Type.String())
});

export type ProjectInformativeUpdateBody = Static<typeof ProjectInformativeUpdateSchema>;

export const ProjectInformativeDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type ProjectInformativeDeleteBody = Static<typeof ProjectInformativeDeleteSchema>;
