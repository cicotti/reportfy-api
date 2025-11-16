import { Type, Static } from '@sinclair/typebox';
import { locationSchema } from './common.schema';

export const ProjectItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.String({ format: 'uuid' }),
  client: Type.Optional(Type.Union([
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String()
    }),
    Type.Null()
  ])),
  name: Type.String(),
  planned_start: Type.String({ format: 'date' }),
  planned_end: Type.String({ format: 'date' }),
  actual_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  week_day_report: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  address: Type.String(),
  location: locationSchema,
  status: Type.String(),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.String({ format: 'uuid' })
});

export type ProjectListResult = Static<typeof ProjectItemSchema>;

export const ProjectInsertSchema = Type.Object({
  company_id: Type.String({ format: 'uuid' }),
  client_id: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1 }),
  planned_start: Type.String({ format: 'date' }),
  planned_end: Type.String({ format: 'date' }),
  week_day_report: Type.Optional(Type.Number({ minimum: 0, maximum: 6 })),
  address: Type.String({ minLength: 1 }),
  location: locationSchema,
  is_active: Type.Optional(Type.Boolean())
});

export type ProjectInsertBody = Static<typeof ProjectInsertSchema>;

export const ProjectUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  client_id: Type.Optional(Type.String({ format: 'uuid' })),
  name: Type.Optional(Type.String({ minLength: 1 })),
  planned_start: Type.Optional(Type.String({ format: 'date' })),
  planned_end: Type.Optional(Type.String({ format: 'date' })),
  actual_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  week_day_report: Type.Optional(Type.Union([Type.Number({ minimum: 0, maximum: 6 }), Type.Null()])),
  address: Type.Optional(Type.String({ minLength: 1 })),
  location: Type.Optional(locationSchema),
  is_active: Type.Optional(Type.Boolean())
});

export type ProjectUpdateBody = Static<typeof ProjectUpdateSchema>;

export const ProjectDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type ProjectDeleteBody = Static<typeof ProjectDeleteSchema>;

export const ProjectQuerySchema = Type.Object({
  client_id: Type.Optional(Type.String({ format: 'uuid' }))
});

export type ProjectQuery = Static<typeof ProjectQuerySchema>;

export const ProjectIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type ProjectIdParam = Static<typeof ProjectIdParamSchema>;
