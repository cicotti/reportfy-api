import { Type, Static } from '@sinclair/typebox';

export const ClientItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  document: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  telephone: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  contact: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.String({ format: 'uuid' }),
  company: Type.Optional(Type.Union([
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String()
    }),
    Type.Null()
  ]))
});

export type ClientListResult = Static<typeof ClientItemSchema>;

export const ClientInsertSchema = Type.Object({
  company_id: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1 }),
  document: Type.Optional(Type.String()),
  telephone: Type.Optional(Type.String()),
  contact: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean())
});

export type ClientInsertBody = Static<typeof ClientInsertSchema>;

export const ClientUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.Optional(Type.String({ minLength: 1 })),
  document: Type.Optional(Type.String()),
  telephone: Type.Optional(Type.String()),
  contact: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean())
});

export type ClientUpdateBody = Static<typeof ClientUpdateSchema>;

export const ClientDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type ClientDeleteBody = Static<typeof ClientDeleteSchema>;

export const ClientQuerySchema = Type.Object({
  client_id: Type.Optional(Type.String({ format: 'uuid' })),
  company_id: Type.Optional(Type.String({ format: 'uuid' }))
});

export type ClientQuery = Static<typeof ClientQuerySchema>;
