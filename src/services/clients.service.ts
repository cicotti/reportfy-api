import { createAuthenticatedSaasClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ClientListResult, ClientInsertBody, ClientUpdateBody, ClientDeleteBody, ClientQuery } from '../schemas/clients.schema';
import { ApiError } from '../lib/errors';

export const fetchClients = async (authToken: string, queryString?: ClientQuery): Promise<ClientListResult[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let query = saasClient
      .from("clients")
      .select("*, company:companies(id, name)")
      .eq("is_soft_deleted", false)
      .order("name", { ascending: true });

    if (queryString && queryString.company_id) {
      query = query.eq("company_id", queryString.company_id!);
    }

    const { data, error } = await query;
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    const clientsWithCompany = (data || []).map((client: any) => ({
      ...client,
      company: client.company ?? null,
    })) as ClientListResult[];

    return clientsWithCompany;
  } catch (error: any) {
    console.error("clients.fetchClients error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createClient = async (authToken: string, data: ClientInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { data: result, error } = await saasClient
      .from("clients")
      .insert([data])
      .select("id")
      .single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
    
    return { id: result.id };
  } catch (error: any) {
    console.error("clients.createClient error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateClient = async (authToken: string, data: ClientUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("clients")
      .update(data)
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("clients.updateClient error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteClient = async (authToken: string, data: ClientDeleteBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("clients")
      .update({ is_active: false, is_soft_deleted: true })
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("clients.deleteClient error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
