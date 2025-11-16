/*import { Type, Static } from '@sinclair/typebox';

export const InformativeTypeItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  display_order: Type.Number(),
  is_mandatory: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.String({ format: 'uuid' })
});

export type InformativeTypeListResult = Static<typeof InformativeTypeItemSchema>;

export const InformativeTypeInsertSchema = Type.Object({
  company_id: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1 }),
  display_order: Type.Optional(Type.Number({ minimum: 0 })),
  is_mandatory: Type.Optional(Type.Boolean())
});

export type InformativeTypeInsertBody = Static<typeof InformativeTypeInsertSchema>;

export const InformativeTypeUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.Optional(Type.String({ minLength: 1 })),
  display_order: Type.Optional(Type.Number({ minimum: 0 })),
  is_mandatory: Type.Optional(Type.Boolean())
});

export type InformativeTypeUpdateBody = Static<typeof InformativeTypeUpdateSchema>;

export const InformativeTypeDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type InformativeTypeDeleteBody = Static<typeof InformativeTypeDeleteSchema>;

export const InformativeTypeQuerySchema = Type.Object({
  company_id: Type.Optional(Type.String({ format: 'uuid' }))
});

export type InformativeTypeQuery = Static<typeof InformativeTypeQuerySchema>;

// Project Informatives Schemas
export const ProjectInformativeItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  informative_type_id: Type.String({ format: 'uuid' }),
  content: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.String({ format: 'uuid' }),
  informative_type_name: Type.Optional(Type.String())
});

export type ProjectInformativeListResult = Static<typeof ProjectInformativeItemSchema>;

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

export const ProjectInformativeProjectIdParamSchema = Type.Object({
  projectId: Type.String({ format: 'uuid' })
});

export type ProjectInformativeProjectIdParam = Static<typeof ProjectInformativeProjectIdParamSchema>;
*/