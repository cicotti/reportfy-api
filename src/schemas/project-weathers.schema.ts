import { Type, Static } from '@sinclair/typebox';

export const WeatherItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  project_id: Type.String({ format: 'uuid' }),
  weather_date: Type.String({ format: 'date' }),
  min_temperature: Type.Number(),
  max_temperature: Type.Number(),
  climate: Type.String(),
  is_prediction: Type.Boolean()
});

export type WeatherListResult = Static<typeof WeatherItemSchema>;

export const WeatherQuerySchema = Type.Object({
  project_id: Type.Optional(Type.String({ format: 'uuid' }))
});

export type WeatherQuery = Static<typeof WeatherQuerySchema>;

export const WeatherSyncSchema = Type.Object({
  project_id: Type.String({ format: 'uuid' })
});

export type WeatherSyncBody = Static<typeof WeatherSyncSchema>;
