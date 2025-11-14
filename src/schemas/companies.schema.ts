import { Type, Static } from '@sinclair/typebox';

export const CompanyItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  document: Type.String(),
  telephone: Type.String(),
  plan: Type.Union([
    Type.Literal('basic'),
    Type.Literal('professional'),
    Type.Literal('enterprise')
  ]),
  plan_expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  trial_ends_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.String({ format: 'uuid' }),
  users_count: Type.Number()
});

export type CompanyListResult = Static<typeof CompanyItemSchema>;

export const CompanyInsertSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  document: Type.String({ minLength: 1 }),
  telephone: Type.String({ minLength: 1 }),
  plan: Type.Union([
    Type.Literal('basic'),
    Type.Literal('professional'),
    Type.Literal('enterprise')
  ]),
  is_active: Type.Boolean()
});

export type CompanyInsertBody = Static<typeof CompanyInsertSchema>;

export const CompanyUpdateSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  telephone: Type.String({ minLength: 1 }),
  plan: Type.Union([
    Type.Literal('basic'),
    Type.Literal('professional'),
    Type.Literal('enterprise')
  ]),
  is_active: Type.Boolean()
});

export type CompanyUpdateBody = Static<typeof CompanyUpdateSchema>;