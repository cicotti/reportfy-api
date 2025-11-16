import { supabase, supabaseSaas, createAuthenticatedSaasClient, createAuthenticatedClient } from '@/lib/supabase';
import { translateErrorCode, setLanguage } from 'supabase-error-translator-js';
import { LoginBody, UserSessionResult, ProfileResult, SignupBody, ResetPasswordBody, UpdatePasswordBody } from '@/schemas/saas/auth.schema';
import { ApiError } from '@/lib/errors';

export const checkRsl = async (authToken: string): Promise<Object> => {
  const saasClient = createAuthenticatedSaasClient(authToken);
  const { data: companyResult, error: companyError } = await saasClient.from("companies").select("id, name, is_active, is_soft_deleted");
  const { data: profileResult, error: profileError } = await saasClient.from("profiles").select("id, name");
  const { data: userRolesResult, error: userRolesError } = await saasClient.from("user_roles").select("id, role");
  const { data: userSettingsResult, error: userSettingsError } = await saasClient.from("user_settings").select("id, language");
  const { data: clientResult, error: clientError } = await saasClient.from("clients").select("id, name, is_active, is_soft_deleted");

  const publicClient = createAuthenticatedClient(authToken)
  const { data: informativeTypesResult, error: informativeTypesError } = await publicClient.from("informative_types").select("id, name");
  const { data: projectResult, error: projectError } = await publicClient.from("projects").select("id, name");
  const { data: projectTaskResult, error: projectTaskError } = await publicClient.from("project_tasks").select("project_id, name");
  const { data: projectWeatherResult, error: projectWeatherError } = await publicClient.from("project_weathers").select("project_id, name");
  const { data: projectPhotoResult, error: projectPhotoError } = await publicClient.from("project_photos").select("project_id, name");
  const { data: projectInformativeResult, error: projectInformativeError } = await publicClient.from("project_informatives").select("project_id, name");

  return {
    companies: companyResult || [],
    profiles: profileResult || [],
    user_roles: userRolesResult || [],
    user_settings: userSettingsResult || [],
    clients: clientResult || [],
    informative_types: informativeTypesResult || [],
    projects: projectResult || [],
    project_tasks: projectTaskResult || [],
    project_weathers: projectWeatherResult || [],
    project_photos: projectPhotoResult || [],
    project_informatives: projectInformativeResult || []
  };
}

export const hasAccountCreated = async (search: string) => {
  const { data, error } = await supabaseSaas.rpc("has_account_created", { _search: search });
  return { 
    valid: data ?? false,
    error: error ? error.message : null
  };
};

export const checkTenant = async (authToken: string): Promise<void> => {
  const saasClient = createAuthenticatedSaasClient(authToken);
  
  const { data: userData, error: userError } = await saasClient.auth.getUser();
  if (userError || !userData) throw new ApiError("authentication", translateErrorCode(userError?.code, "auth", "pt"));
  
  const { data: tenantData, error: tenantError } = await saasClient.rpc("is_active_tenant", { _user_id: userData.user.id }).single();
  if (tenantError) throw new ApiError("query", translateErrorCode(tenantError?.code, "database", "pt"));

  if (!tenantData) {
    throw new ApiError("tenant_inactive", "A sua conta está inativa. Favor entrar em contato com o suporte.");
  }
};

export const login = async (data: LoginBody): Promise<UserSessionResult> => {
  try {
    if (!data.email || !data.password) {
      throw new ApiError("validation", "Email e senha são obrigatórios");
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email.toLowerCase().trim(),
      password: data.password
    });

    if (error) throw new ApiError("authentication", translateErrorCode(error.code, "auth", "pt"));

    const session = signInData.session;
    if (!session || !session.user) {
      throw new ApiError("validation", "Falha ao criar sessão. Verifique credenciais.");
    }

    return {
      user_id: session.user.id,
      access_token: session.access_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at || 0,
      refresh_token: session.refresh_token
    };
  } catch (error: any) {
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const signup = async (data: SignupBody): Promise<{ id: string }> => {
  try {
    if (!data.email || !data.password || !data.name || !data.company) {
      throw new ApiError("validation", "Preencha campos obrigatórios");
    }

    const has_email = await hasAccountCreated(data.email.toLowerCase().trim());
    const has_document = await hasAccountCreated(data.company.document);

    if (has_email.error || has_document.error) {
      throw new ApiError("query", "Erro ao verificar conta existente");      
    } else if (has_email.valid) {
      throw new ApiError("validation", "Email já cadastrado");
    } else if (has_document.valid) {
      throw new ApiError("validation", "Empresa já cadastrada");
    }

    // Create user account, company, profile, profile user_role and user_settings
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
      email: data.email.toLowerCase().trim(),
      password: data.password,
      options: { data: { 
        name: data.name,
        company_name: data.company.name,
        company_document: data.company.document,
        company_telephone: data.company.telephone
      }}
    });

    if (signUpError) throw new ApiError("authentication", translateErrorCode(signUpError.code, "auth", "pt"));
    
    return { id: signUpData.user?.id || "" };
  } catch (error: any) {
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const getCurrentUser = async (authToken: string): Promise<ProfileResult> => {
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

    return {
      id: user.id,
      company_id: profileData.company_id,
      email: profileData.email,
      name: profileData.name,
      role: roleData?.role || 'user',
      avatar_url: profileData?.avatar_url
    };
  } catch (error: any) {
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const resetPassword = async (data: ResetPasswordBody): Promise<void> => {
  try {
    if (!data.email) {
      throw new ApiError("validation", "Email é obrigatório");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo: data.redirectTo });
    
    if (error) throw new ApiError("authentication", translateErrorCode(error.code, "auth", "pt"));
  } catch (error: any) {
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updatePassword = async (authToken: string, data: UpdatePasswordBody): Promise<void> => {
  try {
    if (!data.newPassword) {
      throw new ApiError("validation", "Nova senha é obrigatória");
    }
    const saasClient = createAuthenticatedSaasClient(authToken);
    const { error } = await saasClient.auth.updateUser({ password: data.newPassword });
    
    if (error) throw new ApiError("authentication", translateErrorCode(error.code, "auth", "pt"));
  } catch (error: any) {
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
