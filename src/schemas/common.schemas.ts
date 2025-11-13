import { Type, Static } from '@sinclair/typebox';

// ===== Common Schemas =====
export const ErrorSchema = Type.Object({
  type: Type.Union([
    Type.Literal('validation'),
    Type.Literal('query'),
    Type.Literal('critical'),
  ]),
  message: Type.Optional(Type.String())
});

export const MessageSchema = Type.Object({
  message: Type.String()
});

export const IdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export const IdMessageSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  message: Type.String()
});

// ===== User Schemas =====
export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  role: Type.Union([
    Type.Literal('admin'),
    Type.Literal('user'),
    Type.Literal('super_user')
  ]),
  avatar_url: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()]))
});

export const UserProfileUpdateSchema = Type.Object({
  full_name: Type.Optional(Type.String()),
  avatar_url: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()]))
});

export const UserRoleSchema = Type.Object({
  role: Type.Union([
    Type.Literal('admin'),
    Type.Literal('user'),
    Type.Literal('super_user')
  ])
});

// ===== Auth Schemas =====
export const LoginBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 })
});

export const SignupBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  full_name: Type.String({ minLength: 1 }),
  company: Type.Object({
    name: Type.String({ minLength: 1 }),
    document: Type.String({ minLength: 1 }),
    telephone: Type.String({ minLength: 1 })
  })
});

export const ResetPasswordBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  redirectTo: Type.Optional(Type.String({ format: 'uri' }))
});

export const UpdatePasswordBodySchema = Type.Object({
  newPassword: Type.String({ minLength: 6 })
});

export const LoginResponseSchema = Type.Object({
  user: Type.Union([UserSchema, Type.Null()]),
  session: Type.Any()
});

export const SignupResponseSchema = Type.Object({
  user: Type.Union([Type.String(), Type.Null()])
});

// ===== Company Schemas =====
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
  users_count: Type.Number()
});

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

// ===== Client Schemas =====
export const ClientSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  email: Type.Optional(Type.Union([Type.String({ format: 'email' }), Type.Null()])),
  telephone: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  document: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  address: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  city: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  state: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  zipcode: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.Optional(Type.String({ format: 'date-time' }))
});

export const ClientInsertSchema = Type.Object({
  company_id: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1 }),
  email: Type.Optional(Type.String({ format: 'email' })),
  telephone: Type.Optional(Type.String()),
  document: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  city: Type.Optional(Type.String()),
  state: Type.Optional(Type.String()),
  zipcode: Type.Optional(Type.String())
});

export const ClientUpdateSchema = Type.Partial(Type.Omit(ClientInsertSchema, ['company_id']));

export const ClientQuerySchema = Type.Object({
  company_id: Type.Optional(Type.String({ format: 'uuid' }))
});

// ===== Project Schemas =====
export const ProjectSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  client_id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  location: Type.Optional(Type.Any()), // JSONB
  status: Type.Union([
    Type.Literal('planning'),
    Type.Literal('in_progress'),
    Type.Literal('completed'),
    Type.Literal('on_hold')
  ]),
  start_date: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  end_date: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),
  budget: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.Optional(Type.String({ format: 'date-time' }))
});

export const ProjectWithClientSchema = Type.Intersect([
  ProjectSchema,
  Type.Object({
    client: Type.Object({
      name: Type.String(),
      email: Type.Optional(Type.Union([Type.String({ format: 'email' }), Type.Null()])),
      telephone: Type.Optional(Type.Union([Type.String(), Type.Null()]))
    })
  })
]);

export const ProjectInsertSchema = Type.Object({
  client_id: Type.String({ format: 'uuid' }),
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  location: Type.Optional(Type.Any()),
  status: Type.Optional(Type.Union([
    Type.Literal('planning'),
    Type.Literal('in_progress'),
    Type.Literal('completed'),
    Type.Literal('on_hold')
  ])),
  start_date: Type.Optional(Type.String({ format: 'date' })),
  end_date: Type.Optional(Type.String({ format: 'date' })),
  budget: Type.Optional(Type.Number({ minimum: 0 }))
});

export const ProjectUpdateSchema = Type.Partial(Type.Omit(ProjectInsertSchema, ['client_id']));

export const ProjectQuerySchema = Type.Object({
  client_id: Type.Optional(Type.String({ format: 'uuid' }))
});

// ===== Weather Schemas =====
export const WeatherSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  date: Type.String({ format: 'date' }),
  temperature: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  humidity: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  wind_speed: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  precipitation: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  created_at: Type.String({ format: 'date-time' })
});

export const WeatherSyncBodySchema = Type.Object({
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 })
});

export const ProjectIdParamSchema = Type.Object({
  projectId: Type.String({ format: 'uuid' })
});

// ===== Photo Schemas =====
export const PhotoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  url: Type.String({ format: 'uri' }),
  thumbnail_url: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()])),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  uploaded_by: Type.String({ format: 'uuid' }),
  created_at: Type.String({ format: 'date-time' })
});

// Type exports for TypeScript
export type User = Static<typeof UserSchema>;
export type LoginBody = Static<typeof LoginBodySchema>;
export type SignupBody = Static<typeof SignupBodySchema>;
export type ResetPasswordBody = Static<typeof ResetPasswordBodySchema>;
export type UpdatePasswordBody = Static<typeof UpdatePasswordBodySchema>;

export type CompanyItem = Static<typeof CompanyItemSchema>;
export type CompanyInsert = Static<typeof CompanyInsertSchema>;
export type CompanyUpdate = Static<typeof CompanyUpdateSchema>;

export type Client = Static<typeof ClientSchema>;
export type ClientInsert = Static<typeof ClientInsertSchema>;
export type ClientUpdate = Static<typeof ClientUpdateSchema>;
export type Project = Static<typeof ProjectSchema>;
export type ProjectInsert = Static<typeof ProjectInsertSchema>;
export type ProjectUpdate = Static<typeof ProjectUpdateSchema>;
export type Weather = Static<typeof WeatherSchema>;
export type WeatherSyncBody = Static<typeof WeatherSyncBodySchema>;
export type Photo = Static<typeof PhotoSchema>;
