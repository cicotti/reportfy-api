import { supabaseSaas } from '../../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { TranslationListResult, TranslationQuery } from '../../schemas/saas/translations.schema';
import { ApiError } from '../../lib/errors';

export const fetchTranslations = async (queryString?: TranslationQuery): Promise<TranslationListResult[]> => {
  try {
    let query = supabaseSaas
      .from("translations")
      .select("*")
      .order("language", { ascending: true })
      .order("key", { ascending: true });
    
    if (queryString) {
      if (queryString.translation_id) {
        query = query.eq("id", queryString.translation_id);
      }
      if (queryString.key) {
        query = query.eq("key", queryString.key);
      }
      if (queryString.language) {
        query = query.eq("language", queryString.language);
      }
    }

    const { data, error } = await query;

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data || []) as TranslationListResult[];
  } catch (error: any) {
    console.error("translations.fetchTranslations error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
