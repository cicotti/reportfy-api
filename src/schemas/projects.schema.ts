import { Type, Static } from '@sinclair/typebox';
import { LocationSchema, ProjectStatusSchema } from './common.schema';

export const ProjectItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.String({ format: 'uuid' }),
  client: Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String()
  }),
  name: Type.String(),
  address: Type.String(),
  location: LocationSchema,
  status: ProjectStatusSchema,
  completion_percentage: Type.Number({ minimum: 0, maximum: 100 }),
  planned_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  planned_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),  
  variance: Type.Optional(Type.Number()),
  is_active: Type.Boolean(),
  created_by: Type.String({ format: 'uuid' }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
  updated_by: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()]))
});

export type ProjectListResult = Static<typeof ProjectItemSchema>;

export const ProjectInsertSchema = Type.Object({
  company_id: Type.String({ format: 'uuid' }),
  client_id: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1 }),
  address: Type.String({ minLength: 1 }),
  location: LocationSchema,
  is_active: Type.Boolean()
});

export type ProjectInsertBody = Static<typeof ProjectInsertSchema>;

export const ProjectUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.Optional(Type.String({ minLength: 1 })),
  address: Type.Optional(Type.String({ minLength: 1 })),
  location: Type.Optional(LocationSchema),
  is_active: Type.Optional(Type.Boolean())
});

export type ProjectUpdateBody = Static<typeof ProjectUpdateSchema>;

export const ProjectDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type ProjectDeleteBody = Static<typeof ProjectDeleteSchema>;

export const ProjectQuerySchema = Type.Object({
  project_id: Type.Optional(Type.String({ 
    format: 'uuid',
    description: 'ID do projeto para filtrar um projeto específico'
  })),
  client_id: Type.Optional(Type.String({ 
    format: 'uuid',
    description: 'ID do cliente para filtrar projetos de um cliente específico'
  }))
});

export type ProjectQuery = Static<typeof ProjectQuerySchema>;
