import { Type, Static } from '@sinclair/typebox';
import { RoleSchema } from '../../schemas/common.schema';

export const LoginBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 100 }),
  password: Type.String({ minLength: 6, maxLength: 32 })
});

export type LoginBody = Static<typeof LoginBodySchema>;

export const UserSessionSchema = Type.Object({
  user_id: Type.String({ format: 'uuid' }),
  access_token: Type.String(),
  expires_in: Type.Number(),
  expires_at: Type.Number(),
  refresh_token: Type.String()  
});

export type UserSessionResult = Static<typeof UserSessionSchema>;

export const SignupBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 100 }),
  password: Type.String({ minLength: 6, maxLength: 32 }),
  name: Type.String({ minLength: 1, maxLength: 50 }),
  company: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    document: Type.String({ minLength: 1, maxLength: 18 }),
    telephone: Type.String({ minLength: 1, maxLength: 15})
  }),
  redirectTo: Type.String({ format: 'uri' })
});

export type SignupBody = Static<typeof SignupBodySchema>;

export const ResetPasswordBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  redirectTo: Type.Optional(Type.String({ format: 'uri' }))
});

export type ResetPasswordBody = Static<typeof ResetPasswordBodySchema>;

export const UpdatePasswordBodySchema = Type.Object({
  newPassword: Type.String({ minLength: 6 })
});

export type UpdatePasswordBody = Static<typeof UpdatePasswordBodySchema>;

export const RefreshTokenBodySchema = Type.Object({
  refresh_token: Type.String({ minLength: 1 })
});

export type RefreshTokenBody = Static<typeof RefreshTokenBodySchema>;

export const TokenValiditySchema = Type.Object({
  valid: Type.Boolean(),
  user_id: Type.Optional(Type.String({ format: 'uuid' })),
  expires_at: Type.Optional(Type.Number())
});

export type TokenValidityResult = Static<typeof TokenValiditySchema>;
