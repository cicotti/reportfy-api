import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { getCurrentWeekStart, getNextWeekEnd, getNextWeekStart } from '../lib/utils';
import { WeatherListResult, WeatherSyncBody, WeatherQuery } from '../schemas/project-weathers.schema';
import { ApiError } from '../lib/errors';

export const getProjectWeather = async (authToken: string, queryString?: WeatherQuery): Promise<WeatherListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const currentWeekStart = getCurrentWeekStart();
    const nextWeekEnd = getNextWeekEnd();

    let query = client
      .from("project_weathers")
      .select("*")
      .gte("weather_date", currentWeekStart)
      .lte("weather_date", nextWeekEnd)
      .order("weather_date", { ascending: true });

    if (queryString?.project_id) {
      query = query.eq("project_id", queryString.project_id);
    }

    const { data, error } = await query;

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data || []) as WeatherListResult[];
  } catch (error: any) {
    console.error("project-weather.getProjectWeather error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export function getWeatherDescription(weatherCode: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa intensa",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva intensa",
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve intensa",
    80: "Pancadas de chuva leves",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva violentas",
    95: "Trovoada",
    96: "Trovoada com granizo leve",
    99: "Trovoada com granizo intenso",
  };

  return weatherCodes[weatherCode] || "Clima não especificado";
}

export async function fetchWeatherFromAPI(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<any> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError("critical", `API request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("project-weather.fetchWeatherFromAPI error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro ao buscar clima da API");
  }
}

export const syncProjectWeatherFromAPI = async (
  authToken: string,
  syncData: WeatherSyncBody
): Promise<void> => {
  try {
    const { project_id: projectId, latitude, longitude } = syncData;
    const client = createAuthenticatedClient(authToken);
    const today = new Date().toISOString().split('T')[0];
    const currentWeekStart = getCurrentWeekStart();
    const nextWeekStart = getNextWeekStart();
    const nextWeekEnd = getNextWeekEnd();
    
    const { count } = await client
      .from("project_weathers")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .gte("weather_date", currentWeekStart)
      .lte("weather_date", nextWeekEnd)
      .gte("updated_at", today);

    if (count == 14) return;

    const currentData = await fetchWeatherFromAPI(latitude, longitude, currentWeekStart, nextWeekEnd);

    if (currentData?.daily) {
      const currentWeekRecords = currentData.daily.time.map(
        (date: string, index: number) => ({
          project_id: projectId,
          weather_date: date,
          min_temperature: Math.round(currentData.daily.temperature_2m_min[index]),
          max_temperature: Math.round(currentData.daily.temperature_2m_max[index]),
          climate: getWeatherDescription(currentData.daily.weather_code[index]),
          is_prediction: date >= nextWeekStart ? true : false,
        })
      );
            
      for (const record of currentWeekRecords) {
        await client
          .from("project_weathers")
          .upsert(record, { onConflict: "project_id, weather_date" });
      }
    }
  } catch (error: any) {
    console.error("project-weather.syncProjectWeatherFromAPI error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
