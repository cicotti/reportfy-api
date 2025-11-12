import { createAuthenticatedSaasClient } from '../lib/supabase';
import { ApplicationError } from '../lib/errors';

export interface Client {
  id: string;
  company_id: string;
  name: string;
  document: string | null;
  telephone: string | null;
  contact: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: { id: string; name: string } | null;
}

export interface ClientInsertData {
  company_id: string;
  name: string;
  document?: string;
  telephone?: string;
  contact?: string;
  is_active?: boolean;
}

export interface ClientUpdateData {
  name?: string;
  document?: string;
  telephone?: string;
  contact?: string;
  is_active?: boolean;
}

export const fetchClients = async (authToken: string, companyId?: string): Promise<Client[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let query = saasClient
      .from("clients")
      .select("*, company:companies(id, name)")
      .eq("is_soft_deleted", false)
      .order("name", { ascending: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const clientsWithCompany = (data || []).map((client: any) => ({
      ...client,
      company: client.company ?? null,
    })) as Client[];

    return clientsWithCompany;
  } catch (err: any) {
    console.error("clients.fetchClients error:", err);
    throw new ApplicationError("Erro ao carregar clientes", err?.message ?? "Erro inesperado", true);
  }
};

export const createClient = async (authToken: string, data: ClientInsertData): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient.from("clients").insert([data]);
    if (error) throw error;
  } catch (err: any) {
    console.error("clients.createClient error:", err);
    throw new ApplicationError("Erro ao criar cliente", err?.message ?? "Erro inesperado", true);
  }
};

export const updateClient = async (authToken: string, id: string, data: ClientUpdateData): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("clients")
      .update(data)
      .eq("id", id);

    if (error) throw error;
  } catch (err: any) {
    console.error("clients.updateClient error:", err);
    throw new ApplicationError("Erro ao atualizar cliente", err?.message ?? "Erro inesperado", true);
  }
};

export const softDeleteClient = async (authToken: string, id: string): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("clients")
      .update({ is_active: false, is_soft_deleted: true })
      .eq("id", id);

    if (error) throw error;
  } catch (err: any) {
    console.error("clients.softDeleteClient error:", err);
    throw new ApplicationError("Erro ao excluir cliente", err?.message ?? "Erro inesperado", true);
  }
};
