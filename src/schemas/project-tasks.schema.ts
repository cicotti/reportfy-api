import { Type, Static } from '@sinclair/typebox';

export const ProjectTaskItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  parent_task_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  wbs: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  level: Type.Integer({ minimum: 1, maximum: 3 }),
  name: Type.String(),
  completion_percentage: Type.Integer({ minimum: 0, maximum: 100 }),
  planned_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  planned_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  variance: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
  display_order: Type.Integer(),
  created_by: Type.String({ format: 'uuid' }),
  created_at: Type.String({ format: 'date-time' }),
  updated_by: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  updated_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()]))
});

export type ProjectTaskListResult = Static<typeof ProjectTaskItemSchema>;

export const ProjectTaskInsertSchema = Type.Object({
  project_id: Type.String({ format: 'uuid' }),
  parent_task_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  level: Type.Integer({ minimum: 1, maximum: 3 }),
  name: Type.String({ minLength: 1, maxLength: 500 }),
  completion_percentage: Type.Optional(Type.Integer({ minimum: 0, maximum: 100, default: 0 })),
  planned_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  planned_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  display_order: Type.Optional(Type.Integer({ default: 0 }))
});

export type ProjectTaskInsertBody = Static<typeof ProjectTaskInsertSchema>;

export const ProjectTaskUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 500 })),
  completion_percentage: Type.Optional(Type.Integer({ minimum: 0, maximum: 100 })),
  planned_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  planned_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_start: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  actual_end: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  display_order: Type.Optional(Type.Integer())
});

export type ProjectTaskUpdateBody = Static<typeof ProjectTaskUpdateSchema>;

export const ProjectTaskDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type ProjectTaskDeleteBody = Static<typeof ProjectTaskDeleteSchema>;

export const ProjectTaskProjectIdParamSchema = Type.Object({
  projectId: Type.String({ format: 'uuid' })
});

export type ProjectTaskProjectIdParam = Static<typeof ProjectTaskProjectIdParamSchema>;
