/*import { createAuthenticatedSaasClient, createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { 
  InformativeTypeListResult, 
  InformativeTypeInsertBody, 
  InformativeTypeUpdateBody,
  ProjectInformativeListResult,
  ProjectInformativeInsertBody,
  ProjectInformativeUpdateBody
} from '../schemas/informatives.schema';
import { ApiError } from '../lib/errors';

// Informative Types Services
export const fetchInformativeTypes = async (authToken: string, companyId?: string): Promise<InformativeTypeListResult[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let query = saasClient
      .from("informative_types")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data as InformativeTypeListResult[]) || [];
  } catch (error: any) {
    console.error("informatives.fetchInformativeTypes error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createInformativeType = async (authToken: string, data: InformativeTypeInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { data: insertData, error } = await saasClient
      .from("informative_types")
      .insert([data])
      .select("id")
      .single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
    
    return { id: insertData.id };
  } catch (error: any) {
    console.error("informatives.createInformativeType error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateInformativeType = async (authToken: string, id: string, data: InformativeTypeUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("informative_types")
      .update(data)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("informatives.updateInformativeType error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteInformativeType = async (authToken: string, id: string): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("informative_types")
      .delete()
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("informatives.deleteInformativeType error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

// Project Informatives Services
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
    console.error("informatives.fetchProjectInformatives error:", error);
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
    console.error("informatives.createProjectInformative error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProjectInformative = async (authToken: string, id: string, data: ProjectInformativeUpdateBody): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("project_informatives")
      .update(data)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("informatives.updateProjectInformative error:", error);
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
    console.error("informatives.deleteProjectInformative error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
*/