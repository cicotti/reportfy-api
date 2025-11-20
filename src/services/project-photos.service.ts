import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { PhotoListResult, PhotoQuery } from '../schemas/project-photos.schema';
import { ApiError } from '../lib/errors';

export const getProjectPhotos = async (authToken: string, queryString?: PhotoQuery): Promise<PhotoListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    let query = client
      .from("project_photos")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (queryString?.project_id) {
      query = query.eq("project_id", queryString.project_id);
    }

    if (queryString?.photo_id) {
      query = query.eq("id", queryString.photo_id);
    }

    const { data, error } = await query;

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data || []) as PhotoListResult[];
  } catch (error: any) {
    console.error("project-photos.getProjectPhotos error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const uploadProjectPhoto = async (authToken: string, user_id: string, data: any): Promise<PhotoListResult> => {
  try {    
    const buffer = await data.toBuffer();
    const project_id = data.fields?.project_id?.value as string;
    const description = data.fields?.description?.value as string | undefined;
    
    if (!data || data.filename === "") {
      throw new ApiError("validation", "Arquivo não fornecido");
    }

    const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
    if (Buffer.byteLength(buffer) > MAX_BYTES) {
      throw new ApiError("validation", "Arquivo muito grande, o tamanho máximo permitido para fotos é de 3MB.");
    }

    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(data.mimetype)) {
      throw new ApiError("validation", "Tipo de arquivo não suportado. Envie uma imagem JPG/PNG/GIF/WEBP.");
    }

    if (!project_id) {
      throw new ApiError("validation", "project_id é obrigatório");
    }    

    const client = createAuthenticatedClient(authToken);
    
    const fileExt = data.filename.split(".").pop();
    const storagePath = `${project_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await client.storage
      .from("project-photos")
      .upload(storagePath, buffer, {
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
      .eq("project_id", project_id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.display_order ?? -1) + 1;

    const { data: photoData, error: photoError } = await client
      .from("project_photos")
      .insert({
        project_id: project_id,
        photo_url: urlData.publicUrl,
        description: description || null,
        display_order: nextOrder,
        created_by: user_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (photoError) {
      await client.storage.from("project-photos").remove([storagePath]);
      throw new ApiError("query", translateErrorCode(photoError.code, "database", "pt"));
    }

    return photoData as PhotoListResult;
  } catch (error: any) {
    console.error("project-photos.uploadProjectPhoto error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProjectPhoto = async (authToken: string, id: string, photoData: { description?: string | null }): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("project_photos")
      .update(photoData)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-photos.updateProjectPhoto error:", error);
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
    console.error("project-photos.deleteProjectPhoto error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
