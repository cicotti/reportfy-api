import { createAuthenticatedSaasClient } from '../lib/supabase';
import { ApplicationError } from '../lib/errors';

export type Role = "admin" | "super_user" | "user";

export interface UserProfile {
  id: string;
  company_id: string;
  company_name: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  company?: { id: string; name: string } | null;
  role?: string;
}

export const fetchUsers = async (authToken: string, companyId?: string): Promise<UserProfile[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let query = saasClient
      .from("profiles")
      .select("*, company:companies(name, id), user_roles(role)")
      .order("full_name", { ascending: true });

    if (companyId) query = query.eq("company_id", companyId);

    const { data, error } = await query;
    if (error) throw error;

    const usersWithCompany = (data || []).map((profile: any) => ({
      ...profile,
      company_name: profile.company?.name ?? "-",
      company_id: profile.company_id ?? profile.company?.id ?? "",
      company: profile.company ?? null,
      role: profile.user_roles?.[0]?.role ?? undefined,
    })) as UserProfile[];

    return usersWithCompany;
  } catch (err: any) {
    console.error("users.fetchUsers error:", err);
    throw new ApplicationError("Erro ao carregar usuários", err?.message ?? "Erro inesperado", true);
  }
};

export const updateProfile = async (authToken: string, id: string, profileData: Record<string, any>) => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { data, error } = await saasClient
      .from("profiles")
      .update(profileData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("users.updateProfile error:", err);
    throw new ApplicationError("Erro ao atualizar usuário", err?.message ?? "Erro inesperado", true);
  }
};

export const deleteUser = async (authToken: string, userId: string) => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient.from("profiles").delete().eq("id", userId);
    if (error) {
      throw new ApplicationError("Erro ao excluir usuário", error.message);
    }    
  } catch (err: any) {
    console.error("users.deleteUser error:", err);
    throw new ApplicationError("Erro ao excluir usuário", err?.message ?? "Erro inesperado", true);
  }
};

export const upsertUserRole = async (authToken: string, userId: string, role?: Role | undefined) => {
  if (!role) return;
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error: delErr } = await saasClient.from("user_roles").delete().eq("user_id", userId);
    if (delErr) throw delErr;

    const { error: insErr } = await saasClient.from("user_roles").insert([{ user_id: userId, role: role as Role }]);
    if (insErr) throw insErr;

    return true;
  } catch (err: any) {
    console.error("users.upsertUserRole error:", err);
    throw new ApplicationError("Erro ao definir função", err?.message ?? "Erro inesperado", true);
  }
};
