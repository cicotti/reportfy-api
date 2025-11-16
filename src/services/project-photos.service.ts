import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { PhotoListResult } from '../schemas/project-photos.schema';
import { ApiError } from '../lib/errors';

export const getProjectPhotos = async (authToken: string, projectId: string): Promise<PhotoListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { data, error } = await client
      .from("project_photos")
      .select("*")
      .eq("project_id", projectId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data as PhotoListResult[]) || [];
  } catch (error: any) {
    console.error("photos.getProjectPhotos error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const uploadProjectPhoto = async (
  authToken: string,
  projectId: string,
  file: Buffer,
  fileName: string,
  description?: string
): Promise<PhotoListResult> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const fileExt = fileName.split(".").pop();
    const storagePath = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await client.storage
      .from("project-photos")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw new ApiError("critical", translateErrorCode(uploadError.message, "storage", "pt"));

    const { data: urlData } = client.storage
      .from("project-photos")
      .getPublicUrl(storagePath);

    const { data: maxOrderData } = await client
      .from("project_photos")
      .select("display_order")
      .eq("project_id", projectId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.display_order ?? -1) + 1;

    const { data, error } = await client
      .from("project_photos")
      .insert({
        project_id: projectId,
        photo_url: urlData.publicUrl,
        description: description || null,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      await client.storage.from("project-photos").remove([storagePath]);
      throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
    }

    return data as PhotoListResult;
  } catch (error: any) {
    console.error("photos.uploadProjectPhoto error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteProjectPhoto = async (authToken: string, photoId: string, photoUrl: string): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error: dbError } = await client
      .from("project_photos")
      .delete()
      .eq("id", photoId);

    if (dbError) throw new ApiError("query", translateErrorCode(dbError.code, "database", "pt"));

    const url = new URL(photoUrl);
    const pathParts = url.pathname.split("/project-photos/");
    const filePath = pathParts[1];

    if (filePath) {
      await client.storage
        .from("project-photos")
        .remove([filePath]);
    }
  } catch (error: any) {
    console.error("photos.deleteProjectPhoto error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
