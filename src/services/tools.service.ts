import { createAuthenticatedSaasClient, createAuthenticatedClient } from '../lib/supabase';

export const checkRsl = async (authToken: string): Promise<Object> => {
  const saasClient = createAuthenticatedSaasClient(authToken);
  const { data: companyResult, error: companyError } = await saasClient.from("companies").select("id, name, is_active, is_soft_deleted");
  const { data: profileResult, error: profileError } = await saasClient.from("profiles").select("id, name");
  const { data: userRolesResult, error: userRolesError } = await saasClient.from("user_roles").select("id, role");
  const { data: userSettingsResult, error: userSettingsError } = await saasClient.from("user_settings").select("id, language");
  const { data: clientResult, error: clientError } = await saasClient.from("clients").select("id, name, is_active, is_soft_deleted");

  const publicClient = createAuthenticatedClient(authToken)
  const { data: informativeTypesResult, error: informativeTypesError } = await publicClient.from("informative_types").select("id, name");
  const { data: projectResult, error: projectError } = await publicClient.from("projects").select("id, name");
  const { data: projectTaskResult, error: projectTaskError } = await publicClient.from("project_tasks").select("project_id, name");
  const { data: projectWeatherResult, error: projectWeatherError } = await publicClient.from("project_weathers").select("project_id, name");
  const { data: projectPhotoResult, error: projectPhotoError } = await publicClient.from("project_photos").select("project_id, name");
  const { data: projectInformativeResult, error: projectInformativeError } = await publicClient.from("project_informatives").select("project_id, name");

  return {
    companies: companyResult || [],
    profiles: profileResult || [],
    user_roles: userRolesResult || [],
    user_settings: userSettingsResult || [],
    clients: clientResult || [],
    informative_types: informativeTypesResult || [],
    projects: projectResult || [],
    project_tasks: projectTaskResult || [],
    project_weathers: projectWeatherResult || [],
    project_photos: projectPhotoResult || [],
    project_informatives: projectInformativeResult || []
  };
};