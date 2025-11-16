import { createAuthenticatedClient } from '@/lib/supabase';

export interface ProjectPhoto {
  id: string;
  project_id: string;
  photo_url: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function getProjectPhotos(authToken: string, projectId: string): Promise<ProjectPhoto[]> {
  const client = createAuthenticatedClient(authToken);
  
  const { data, error } = await client
    .from("project_photos")
    .select("*")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching project photos:", error);
    throw error;
  }

  return (data as ProjectPhoto[]) || [];
}

export async function uploadProjectPhoto(
  authToken: string,
  projectId: string,
  file: Buffer,
  fileName: string,
  description?: string
): Promise<ProjectPhoto> {
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

    if (uploadError) {
      console.error("Error uploading photo:", uploadError);
      throw uploadError;
    }

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
      console.error("Error creating photo record:", error);
      await client.storage.from("project-photos").remove([storagePath]);
      throw error;
    }

    return data as ProjectPhoto;
  } catch (error) {
    console.error("Error in uploadProjectPhoto:", error);
    throw error;
  }
}

export async function deleteProjectPhoto(authToken: string, photo: ProjectPhoto): Promise<void> {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const url = new URL(photo.photo_url);
    const pathParts = url.pathname.split("/project-photos/");
    const filePath = pathParts[1];

    const { error: dbError } = await client
      .from("project_photos")
      .delete()
      .eq("id", photo.id);

    if (dbError) {
      console.error("Error deleting photo from database:", dbError);
      throw dbError;
    }

    if (filePath) {
      await client.storage
        .from("project-photos")
        .remove([filePath]);
    }
  } catch (error) {
    console.error("Error in deleteProjectPhoto:", error);
    throw error;
  }
}
