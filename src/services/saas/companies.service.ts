import { createAuthenticatedSaasClient } from '@/lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { CompanyListResult, CompanyInsertBody, CompanyUpdateBody, CompanyDeleteBody } from '@/schemas/saas/companies.schema';
import { ApiError } from '@/lib/errors';

export const fetchCompanies = async (authToken: string): Promise<CompanyListResult[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { data, error } = await saasClient
      .from("companies")
      .select("*, profiles!profiles_company_id_fkey(count)")
      .order("name", { ascending: true });
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    const companiesWithCount = (data || []).map((company: any) => ({ 
      ...company, 
      users_count: company.profiles?.[0]?.count ?? 0 
    })) as CompanyListResult[];

    return companiesWithCount;
  } catch (error: any) {
    console.error("companies.fetchCompanies error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createCompany = async (authToken: string, data: CompanyInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { data: result, error } = await saasClient
      .from("companies")
      .insert([data])
      .select("id").single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return { id: result!.id };
  } catch (error: any) {
    console.error("companies.createCompany error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateCompany = async (authToken: string, data: CompanyUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("companies")
      .update(data)
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("companies.updateCompany error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteCompany = async (authToken: string, data: CompanyDeleteBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { error } = await saasClient
      .from("companies")
      .update({ is_active: false, is_soft_deleted: true })
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("companies.deleteCompany error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
