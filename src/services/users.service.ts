import { createAuthenticatedSaasClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { UserListResult, UserInsertBody, UserUpdateBody, UserRoleUpdateBody, UserQuery, UserDeleteBody } from '../schemas/users.schema';
import { ApiError } from '../lib/errors';

export const fetchUsers = async (authToken: string, queryString?: UserQuery): Promise<UserListResult[]> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let queryResult = saasClient
      .from("profiles")
      .select("*, companies!profiles_company_id_fkey(name), user_roles(role)")
      .order("name", { ascending: true });

    if (queryString && queryString.company_id) {
      queryResult = queryResult.eq("company_id", queryString.company_id);
    }

    const { data, error } = await queryResult;
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    const usersWithCompany = (data || []).map((profile: any) => ({
      ...profile,
      company_name: profile.companies?.name ?? "-",
      role: profile.user_roles?.[0]?.role ?? undefined,
    })) as UserListResult[];

    return usersWithCompany;
  } catch (error: any) {
    console.error("users.fetchUsers error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createUser = async (authToken: string, data: UserInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    // Generate a temporary password (user should reset via email)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    
    // Create user in auth.users
    const { data: signUpData, error: signUpError } = await saasClient.auth.admin.createUser({
      email: data.email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        company_id: data.company_id
      }
    });

    if (signUpError) throw new ApiError("authentication", translateErrorCode(signUpError.code, "auth", "pt"));
    if (!signUpData.user) throw new ApiError("critical", "Erro ao criar usuário");

    const userId = signUpData.user.id;

    // Create profile
    const { error: profileError } = await saasClient
      .from("profiles")
      .insert([{
        id: userId,
        company_id: data.company_id,
        email: data.email.toLowerCase().trim(),
        name: data.name,
        avatar_url: data.avatar_url
      }]);

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await saasClient.auth.admin.deleteUser(userId);
      throw new ApiError("query", translateErrorCode(profileError.code, "database", "pt"));
    }

    // Create default user role
    const { error: roleError } = await saasClient
      .from("user_roles")
      .insert([{
        user_id: userId,
        role: 'user'
      }]);

    if (roleError) {
      // Rollback: delete auth user and profile if role creation fails
      await saasClient.auth.admin.deleteUser(userId);
      throw new ApiError("query", translateErrorCode(roleError.code, "database", "pt"));
    }

    // Create default user settings
    const { error: settingsError } = await saasClient
      .from("user_settings")
      .insert([{
        user_id: userId,
        email_notifications: true,
        marketing_emails: false,
        theme: 'system',
        language: 'pt'
      }]);

    if (settingsError) {
      // Rollback: delete auth user, profile and role if settings creation fails
      await saasClient.auth.admin.deleteUser(userId);
      throw new ApiError("query", translateErrorCode(settingsError.code, "database", "pt"));
    }

    // Send password reset email
    const { error: resetError } = await saasClient.auth.resetPasswordForEmail(
      data.email.toLowerCase().trim(),
      { redirectTo: `${process.env.APP_URL}/reset-password` }
    );

    if (resetError) {
      console.warn("Warning: User created but password reset email failed:", resetError);
    }

    return { id: userId };
  } catch (error: any) {
    console.error("users.createUser error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProfile = async (authToken: string, data: UserUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("profiles")
      .update(data)
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("users.updateProfile error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteUser = async (authToken: string, data: UserDeleteBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { error } = await saasClient
      .from("profiles")
      .delete()
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("users.deleteUser error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateUserRole = async (authToken: string, data: UserRoleUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    // Delete existing role
    const { error: delError } = await saasClient
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id);
    
    if (delError) throw new ApiError("query", translateErrorCode(delError.code, "database", "pt"));

    // Insert new role
    const { error: insError } = await saasClient
      .from("user_roles")
      .insert([{ user_id: data.user_id, role: data.role }]);
    
    if (insError) throw new ApiError("query", translateErrorCode(insError.code, "database", "pt"));
  } catch (error: any) {
    console.error("users.updateUserRole error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};