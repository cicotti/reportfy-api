import { Type } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  type: Type.Union([
    Type.Literal('tenant_inactive'),
    Type.Literal('authentication'),
    Type.Literal('validation'),
    Type.Literal('query'),
    Type.Literal('critical'),
  ]),
  message: Type.Optional(Type.String())
});

export const PlanSchema = Type.Union([
  Type.Literal('basic'),
  Type.Literal('professional'),
  Type.Literal('enterprise')
]);

export const RoleSchema = Type.Union([
  Type.Literal('admin'),
  Type.Literal('user'),
  Type.Literal('super_user')
]);

export const ProjectStatusSchema = Type.Union([
  Type.Literal('inactive'),
  Type.Literal('not_started'),
  Type.Literal('in_progress'),
  Type.Literal('delayed'),
  Type.Literal('done')
]);

 export const LocationSchema = Type.Object({
    lat: Type.String(),
    long: Type.String()
  });

export const MessageSchema = Type.Object({
  message: Type.String()
});

export const IdMessageSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  message: Type.String()
});

// ===== Translation Schemas =====
export const TranslationItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  key: Type.String(),
  language: Type.String(),
  value: Type.String(),  
  created_at: Type.String({ format: 'date-time' })
});
