import { Type, Static } from '@sinclair/typebox';

// ===== Common Schemas =====
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

// ===== Translation Schemas =====
export const TranslationItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  key: Type.String(),
  language: Type.String(),
  value: Type.String(),  
  created_at: Type.String({ format: 'date-time' })
});

// ===== Company Schemas =====



// ===== User Schemas =====
export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.Optional(Type.String({ format: 'uuid' })),
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
  name: Type.Optional(Type.String()),
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
export type Client = Static<typeof ClientSchema>;
export type ClientInsert = Static<typeof ClientInsertSchema>;
export type ClientUpdate = Static<typeof ClientUpdateSchema>;
export type Project = Static<typeof ProjectSchema>;
export type ProjectInsert = Static<typeof ProjectInsertSchema>;
export type ProjectUpdate = Static<typeof ProjectUpdateSchema>;
export type Weather = Static<typeof WeatherSchema>;
export type WeatherSyncBody = Static<typeof WeatherSyncBodySchema>;
export type Photo = Static<typeof PhotoSchema>;
