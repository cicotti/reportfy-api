import { supabase, createAuthenticatedSaasClient, adminSupabase } from '../../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { UserListResult, UserContextResult, UserInsertBody, UserUpdateBody, UserRoleUpdateBody, UserQuery, UserDeleteBody, 
  UserSettingsResult, UserSettingsUpdateBody, AvatarUploadResult } from '../../schemas/saas/users.schema';
import { hasAccountCreated } from './auth.service';
import { ApiError } from '../../lib/errors';

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
    const has_email = await hasAccountCreated(data.email.toLowerCase().trim());

    if (has_email.error) {
      throw new ApiError("query", "Erro ao verificar conta existente");      
    } else if (has_email.valid) {
      throw new ApiError("validation", "Email já cadastrado");
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      options: {
        data: {
          name: data.name.trim(),
          company_document: data.company.document.trim(),
        }
      }
    });
    
    if (signUpError) throw new ApiError("authentication", translateErrorCode(signUpError.code, "auth", "pt"));

    if (data.role !== "user") {
       updateUserRole(authToken, { user_id: signUpData.user!.id, role: data.role });
    }
    
    return { id: signUpData.user!.id };
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
    const { error } = await adminSupabase.auth.admin.deleteUser(data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("users.deleteUser error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const getCurrentUserContext = async (authToken: string): Promise<UserContextResult> => {
  try {
    const { data: { user }, error: error } = await supabase.auth.getUser(authToken);
    
    if (error || !user) throw new ApiError("authentication", translateErrorCode(error?.code, "auth", "pt"));

    const saasClient = createAuthenticatedSaasClient(authToken);

    const { data: profileData, error: profileError } = await saasClient
      .from('profiles')
      .select('name, email, avatar_url, company_id')
      .eq('id', user.id)
      .single();

    if (profileError) throw new ApiError("query", translateErrorCode(profileError.code, "database", "pt"));

    const { data: roleData, error: roleError } = await saasClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError) throw new ApiError("query", translateErrorCode(roleError.code, "database", "pt"));

    const {data: settingsData, error: settingsError } = await saasClient
      .from('user_settings')
      .select('language, theme')
      .eq('user_id', user.id)
      .single();

    if (settingsError) throw new ApiError("query", translateErrorCode(settingsError.code, "database", "pt"));

    return {
      id: user.id,
      company_id: profileData.company_id,
      email: profileData.email,
      name: profileData.name,
      role: roleData?.role || 'user',
      avatar_url: profileData?.avatar_url,
      preferences: {
        language: settingsData.language || 'en',
        theme: settingsData.theme || 'light'
      }
    };
  } catch (error: any) {
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

export const getUserSettings = async (authToken: string, user_id: string): Promise<UserSettingsResult> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);

    const { data, error } = await saasClient
      .from("user_settings")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return data as UserSettingsResult;
  } catch (error: any) {
    console.error("users.getUserSettings error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateUserSettings = async (authToken: string, user_id: string, data: UserSettingsUpdateBody): Promise<void> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);    

    const { error } = await saasClient
      .from("user_settings")
      .update(data)
      .eq("user_id", user_id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("users.updateUserSettings error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const uploadAvatar = async (authToken: string, user_id: string, data: any): Promise<AvatarUploadResult> => {
  try {
    const saasClient = createAuthenticatedSaasClient(authToken);

    const buffer = await data.toBuffer();
    const fileName = data.filename;

    // Delete old avatar if exists
    const { data: profileData } = await saasClient
      .from("profiles")
      .select("avatar_url")
      .eq("id", user_id)
      .single();

    if (profileData?.avatar_url) {
      try {
        const url = new URL(profileData.avatar_url);
        const pathParts = url.pathname.split("/avatars/");
        if (pathParts[1]) {
          await saasClient.storage.from("avatars").remove([pathParts[1]]);
        }
      } catch (e) {
        console.warn("Warning: Failed to delete old avatar:", e);
      }
    }

    // Upload new avatar
    const fileExt = fileName.split(".").pop();
    const storagePath = `${user_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await saasClient.storage
      .from("avatars")
      .upload(storagePath, buffer, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw new ApiError("critical", translateErrorCode(uploadError.message, "storage", "pt"));

    const { data: urlData } = saasClient.storage
      .from("avatars")
      .getPublicUrl(storagePath);

    // Update profile with new avatar URL
    const { error: updateError } = await saasClient
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user_id);

    if (updateError) {
      // Rollback: delete uploaded file
      await saasClient.storage.from("avatars").remove([storagePath]);
      throw new ApiError("query", translateErrorCode(updateError.code, "database", "pt"));
    }

    return {
      avatar_url: urlData.publicUrl,
      message: "Avatar atualizado com sucesso"
    };
  } catch (error: any) {
    console.error("users.uploadAvatar error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};