import { createAuthenticatedSaasClient } from '../lib/supabase';
import { ApplicationError } from '../lib/errors';

export type Plan = "basic" | "professional" | "enterprise";

export interface Company {
  id: string;
  name: string;
  document: string;
  telephone: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users_count: number;
}

export interface CompanyInsertData {
  name: string;
  document: string;
  telephone: string;
  plan?: Plan;
  is_active?: boolean;
}

export interface CompanyUpdateData {
  name?: string;
  telephone?: string;
  plan?: Plan;
  is_active?: boolean;
}

export const fetchCompanies = async (authToken: string): Promise<Company[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { data, error } = await saasClient.from("companies").select("*, profiles(count)").order("name", { ascending: false });
    if (error) throw error;
    const companiesWithCount = (data || []).map((company: any) => ({ ...company, users_count: company.profiles?.[0]?.count ?? 0 })) as Company[];
    return companiesWithCount;
  } catch (err: any) {
    console.error("companies.fetchCompanies error:", err);
    throw new ApplicationError("Erro ao carregar empresas", err?.message ?? "Erro inesperado", true);
  }
};

export const createCompany = async (authToken: string, data: CompanyInsertData): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { error } = await saasClient.from("companies").insert([data]);
    if (error) throw error;
  } catch (err: any) {
    console.error("companies.createCompany error:", err);
    throw new ApplicationError("Erro ao criar empresa", err?.message ?? "Erro inesperado", true);
  }
};

export const updateCompany = async (authToken: string, id: string, data: CompanyUpdateData): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { error } = await saasClient.from("companies").update(data).eq("id", id);
    if (error) throw error;
  } catch (err: any) {
    console.error("companies.updateCompany error:", err);
    throw new ApplicationError("Erro ao atualizar empresa", err?.message ?? "Erro inesperado", true);
  }
};

export const deleteCompany = async (authToken: string, id: string): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { error } = await saasClient.from("companies").delete().eq("id", id);
    if (error) throw error;
  } catch (err: any) {
    console.error("companies.deleteCompany error:", err);
    throw new ApplicationError("Erro ao excluir empresa", err?.message ?? "Erro inesperado", true);
  }
};
