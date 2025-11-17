import { Type, Static } from '@sinclair/typebox';
import { RoleSchema } from '../common.schema';

export const UserItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  company_id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  avatar_url: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()])),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.String({ format: 'uuid' }),
  company_name: Type.String(),
  role: RoleSchema
});

export type UserListResult = Static<typeof UserItemSchema>;

export const UserInsertSchema = Type.Object({
  company_id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email', minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  avatar_url: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()]))
});

export type UserInsertBody = Static<typeof UserInsertSchema>;

export const UserUpdateSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.Optional(Type.String({ minLength: 1 })),
  avatar_url: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()]))
});

export type UserUpdateBody = Static<typeof UserUpdateSchema>;

export const UserRoleUpdateSchema = Type.Object({
  user_id: Type.String({ format: 'uuid' }),
  role: RoleSchema
});

export type UserRoleUpdateBody = Static<typeof UserRoleUpdateSchema>;

export const UserDeleteSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type UserDeleteBody = Static<typeof UserDeleteSchema>;

export const UserQuerySchema = Type.Object({
  company_id: Type.Optional(Type.String({ format: 'uuid' }))
});

export type UserQuery = Static<typeof UserQuerySchema>;

export const UserSettingsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  email_notifications: Type.Boolean(),
  marketing_emails: Type.Boolean(),
  theme: Type.Union([Type.Literal('light'), Type.Literal('dark'), Type.Literal('system')]),
  language: Type.String({ minLength: 2, maxLength: 5 }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export type UserSettingsResult = Static<typeof UserSettingsSchema>;

export const UserSettingsUpdateSchema = Type.Object({
  email_notifications: Type.Optional(Type.Boolean()),
  marketing_emails: Type.Optional(Type.Boolean()),
  theme: Type.Optional(Type.Union([Type.Literal('light'), Type.Literal('dark'), Type.Literal('system')])),
  language: Type.Optional(Type.String({ minLength: 2, maxLength: 5 }))
});

export type UserSettingsUpdateBody = Static<typeof UserSettingsUpdateSchema>;

export const AvatarUploadResultSchema = Type.Object({
  avatar_url: Type.String({ format: 'uri' }),
  message: Type.String()
});

export type AvatarUploadResult = Static<typeof AvatarUploadResultSchema>;