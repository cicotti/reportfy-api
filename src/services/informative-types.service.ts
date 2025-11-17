import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { InformativeTypeListResult, InformativeTypeInsertBody, InformativeTypeUpdateBody } from '../schemas/informative-types.schema';
import { ApiError } from '../lib/errors';

export const fetchInformativeTypes = async (authToken: string, companyId?: string): Promise<InformativeTypeListResult[]> => {
  try {
    const saasClient = createAuthenticatedClient(authToken);
    
    let query = saasClient
      .from("informative_types")
      .select("*")
      .order("company_id", { ascending: true })
      .order("display_order", { ascending: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data as InformativeTypeListResult[]) || [];
  } catch (error: any) {
    console.error("informative-types.fetchInformativeTypes error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createInformativeType = async (authToken: string, data: InformativeTypeInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedClient(authToken);
    const { data: { user }, error: userError } = await saasClient.auth.getUser();
    if (userError || !user) throw new ApiError("authentication", "Usuário não autenticado");
    
    const payload = {
      ...data,
      created_by: user.id,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error } = await saasClient
      .from("informative_types")
      .insert([payload])
      .select("id")
      .single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
    
    return { id: insertData.id };
  } catch (error: any) {
    console.error("informative-types.createInformativeType error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateInformativeType = async (authToken: string, id: string, data: InformativeTypeUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedClient(authToken);
    
    const { error } = await saasClient
      .from("informative_types")
      .update(data)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("informative-types.updateInformativeType error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteInformativeType = async (authToken: string, id: string): Promise<void> => {
  try {
    const saasClient = createAuthenticatedClient(authToken);
    
    const { error } = await saasClient
      .from("informative_types")
      .delete()
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("informative-types.deleteInformativeType error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
