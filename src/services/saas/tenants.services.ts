import { createAuthenticatedSaasClient } from '../../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ApiError } from '../../lib/errors';

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