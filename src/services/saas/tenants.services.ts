import { createAuthenticatedSaasClient } from '../../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ApiError } from '../../lib/errors';

export const checkTenant = async (authToken: string, user_id: string): Promise<void> => {
  const saasClient = createAuthenticatedSaasClient(authToken);
  
  const { data: tenantData, error: tenantError } = await saasClient.rpc("is_active_tenant", { _user_id: user_id }).single();
  if (tenantError) throw new ApiError("query", translateErrorCode(tenantError?.code, "database", "pt"));

  if (!tenantData) {
    throw new ApiError("tenant_inactive", "A sua conta está inativa. Favor entrar em contato com o suporte.");
  }
};