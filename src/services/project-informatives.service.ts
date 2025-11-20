import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ProjectInformativeListResult, ProjectInformativeInsertBody, ProjectInformativeUpdateBody, ProjectInformativeQuery } from '../schemas/project-informatives.schema';
import { ApiError } from '../lib/errors';

export const fetchProjectInformatives = async (authToken: string, queryString?: ProjectInformativeQuery): Promise<ProjectInformativeListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    let query = client
      .from("project_informatives")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (queryString?.project_id) {
      query = query.eq("project_id", queryString.project_id);
    }

    if (queryString?.informative_id) {
      query = query.eq("id", queryString.informative_id);
    }

    const { data, error } = await query;
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return data;
  } catch (error: any) {
    console.error("project-informatives.fetchProjectInformatives error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createProjectInformative = async (authToken: string, user_id: string, data: ProjectInformativeInsertBody): Promise<{ id: string }> => {
  try {
    const client = createAuthenticatedClient(authToken);

    const payload = {
      ...data,
      created_by: user_id,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error } = await client
      .from("project_informatives")
      .insert([payload])
      .select("id")
      .single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
    
    return { id: insertData.id };
  } catch (error: any) {
    console.error("project-informatives.createProjectInformative error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProjectInformative = async (authToken: string, id: string, informativeData: Partial<ProjectInformativeUpdateBody>): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("project_informatives")
      .update(informativeData)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-informatives.updateProjectInformative error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteProjectInformative = async (authToken: string, id: string): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("project_informatives")
      .delete()
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-informatives.deleteProjectInformative error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
