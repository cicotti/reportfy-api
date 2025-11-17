import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import {
  ProjectInformativeListResult,
  ProjectInformativeInsertBody,
  ProjectInformativeUpdateBody
} from '../schemas/project-informatives.schema';
import { ApiError } from '../lib/errors';

export const fetchProjectInformatives = async (authToken: string, projectId: string): Promise<ProjectInformativeListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { data, error } = await client
      .from("project_informatives")
      .select("*, informative_types!project_informatives_informative_type_id_fkey(name)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    const informativesWithTypeName = (data || []).map((informative: any) => ({
      ...informative,
      informative_type_name: informative.informative_types?.name ?? "",
    })) as ProjectInformativeListResult[];

    return informativesWithTypeName;
  } catch (error: any) {
    console.error("project-informatives.fetchProjectInformatives error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createProjectInformative = async (authToken: string, data: ProjectInformativeInsertBody): Promise<{ id: string }> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { data: insertData, error } = await client
      .from("project_informatives")
      .insert([data])
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
