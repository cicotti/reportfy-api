import { Type, Static } from '@sinclair/typebox';

export const WeatherItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  weather_date: Type.String({ format: 'date' }),
  min_temperature: Type.Number(),
  max_temperature: Type.Number(),
  climate: Type.String(),
  is_prediction: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export type WeatherListResult = Static<typeof WeatherItemSchema>;

export const WeatherQuerySchema = Type.Object({
  project_id: Type.Optional(Type.String({ format: 'uuid' }))
});

export type WeatherQuery = Static<typeof WeatherQuerySchema>;

export const WeatherSyncSchema = Type.Object({
  project_id: Type.String({ format: 'uuid' }),
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 })
});

export type WeatherSyncBody = Static<typeof WeatherSyncSchema>;
