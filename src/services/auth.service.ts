import { supabase, supabaseSaas, createAuthenticatedSaasClient } from '../lib/supabase';
import { translateErrorCode, setLanguage } from 'supabase-error-translator-js';
import { ApplicationError } from '../lib/errors';

setLanguage("pt");

export interface User {
  id: string;
  company_id?: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'super_user';
  avatar_url?: string;
}

export const getCurrentUser = async (authToken: string): Promise<User | null> => {
  try {
    const { data: { user }, error: sessionError } = await supabase.auth.getUser(authToken);
        
    if (sessionError || !user) {
      console.error('Session fetch error:', sessionError);
      return null;
    }

    const saasClient = createAuthenticatedSaasClient(authToken);

    const { data: profileData, error: profileError } = await saasClient
      .from('profiles')
      .select('full_name, avatar_url, company_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return null;
    }

    const { data: roleData, error: roleError } = await saasClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Role fetch error:', roleError);
      return null;
    }

    return {
      id: user.id,
      company_id: profileData?.company_id,
      email: user.email!,
      name: profileData?.full_name || user.email!,
      role: roleData?.role || 'user',
      avatar_url: profileData?.avatar_url || undefined
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<{ user: User | null; session: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      throw new ApplicationError("Acesso a conta", error.message);
    }
    
    // Pega os dados do usuário logado
    const user = await getCurrentUser(data.session?.access_token);
        
    if (!user) {
      throw new ApplicationError("Acesso a conta", "Não foi possível carregar os dados do usuário. Favor tentar novamente mais tarde.");
    } 
    
    if (user.role != "admin") {
      //Verifica se o tenant do usuário logado está ativo
      const companyData = await activeTenant(data.user.id);
      if (!companyData.company_id || companyData.error) {
        throw new ApplicationError("Acesso a conta", "A sua conta está inativa. Favor entrar em contato com o suporte.");
      }
    }

    return { user, session: data.session };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async (
  email: string, 
  password: string,
  full_name: string,
  companyData: {
    name: string;
    document: string;
    telephone: string;
  }
): Promise<{ user: string | null }> => {
  try {
    const has_email = await hasAccount(email.toLowerCase().trim());
    const has_document = await hasAccount(companyData.document);

    if (has_email.error || has_document.error) {
      throw new ApplicationError("Erro ao verificar conta existente", "Por favor, tente novamente mais tarde.");      
    } else if (has_email.valid) {
      throw new ApplicationError("Email já cadastrado", "Entre com a conta existente ou reinicie sua senha!");
    } else if (has_document.valid) {
      throw new ApplicationError("Empresa já cadastrada", "Fale com o responsável em sua empresa para atualizar sua conta de usuário!");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
          name: companyData.name,
          document: companyData.document,
          telephone: companyData.telephone,
        },
      },
    });

    if (error) {
      throw new ApplicationError("Criação de conta", translateErrorCode(error.code, "auth"));
    }

    return { user: data.user?.id || null };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const hasAccount = async (search: string) => {
  const { data, error } = await supabaseSaas.rpc("exists_account", { _search: search });
  return { 
    valid: data ?? false,
    error: error ? error.message : null
  };
};

export const activeTenant = async (user_id: string) => {
  const { data, error } = await supabaseSaas.rpc("active_tenant", { _user_id: user_id });
  return { 
    company_id: data,
    error: error ? error.message : null
  };
};

export const resetPassword = async (email: string, redirectTo: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) {      
      throw new ApplicationError("Redefinição de senha", translateErrorCode(error.code, "auth"));
    }
  } catch (error) {
    console.error("Erro ao redefinir senha", error);
    throw error;
  }
};

export const updatePassword = async (authToken: string, newPassword: string) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
    
    if (userError || !user) {
      throw new ApplicationError("Usuário não autenticado", "Faça login para continuar");
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });
    
    if (error) {
      throw new ApplicationError("Atualização de senha", translateErrorCode(error.code, "auth"));
    }
  } catch (error) {
    console.error("Erro ao atualizar senha", error);
    throw error;
  }
};
