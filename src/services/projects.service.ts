import { createAuthenticatedClient, createAuthenticatedSaasClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ProjectListResult, ProjectInsertBody, ProjectUpdateBody } from '../schemas/projects.schema';
import { ApiError } from '../lib/errors';

export const fetchProjects = async (authToken: string, clientId?: string): Promise<ProjectListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let query = client
      .from("projects")
      .select("*")
      .eq("is_soft_deleted", false)
      .order("name", { ascending: true });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    const projects = (data || []) as any[];

    if (projects.length === 0) return [];

    const clientIds = Array.from(new Set(projects.map(p => p.client_id).filter(Boolean)));

    let clientsMap: Record<string, { name: string }> = {};
    if (clientIds.length > 0) {
      const { data: clientsData, error: clientsError } = await saasClient
        .from("clients")
        .select("id, name")
        .in("id", clientIds);

      if (clientsError) throw new ApiError("query", translateErrorCode(clientsError.code, "database", "pt"));
      
      if (clientsData) {
        clientsMap = (clientsData as any[]).reduce((acc, c) => {
          acc[c.id] = { name: c.name };
          return acc;
        }, {} as Record<string, { name: string }>);
      }
    }

    const projectsWithData: ProjectListResult[] = projects.map((project) => {
      return {
        ...project,
        client_name: clientsMap[project.client_id]?.name || "",
      } as ProjectListResult;
    });

    return projectsWithData;
  } catch (error: any) {
    console.error("projects.fetchProjects error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const fetchProject = async (authToken: string, projectId: string): Promise<ProjectListResult | null> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("is_soft_deleted", false)
      .single();

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
    if (!data) return null;

    let clientName = "";
    if ((data as any).client_id) {
      const { data: clientData, error: clientError } = await saasClient
        .from("clients")
        .select("name")
        .eq("id", (data as any).client_id)
        .single();

      if (clientError) throw new ApiError("query", translateErrorCode(clientError.code, "database", "pt"));
      if (clientData) clientName = (clientData as any).name || "";
    }

    let location_lat: string | undefined;
    let location_long: string | undefined;
    if (data.location && typeof data.location === "string") {
      const raw = data.location.replace(/[()]/g, "");
      const parts = raw.split(",");
      if (parts.length >= 2) {
        location_lat = parts[0];
        location_long = parts[1];
      }
    }

    return {
      ...data,
      client_name: clientName,
      location_lat,
      location_long,
    } as ProjectListResult;
  } catch (error: any) {
    console.error("projects.fetchProject error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createProject = async (authToken: string, projectData: ProjectInsertBody): Promise<{ id: string }> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const payload: any = { ...projectData };
    if (projectData.location && projectData.location.lat && projectData.location.long) {
      payload.location = `(${projectData.location.lat},${projectData.location.long})`;
    } else {
      payload.location = `(0,0)`;
    }

    const { data: insertData, error } = await client
      .from("projects")
      .insert([payload])
      .select("id")
      .single();

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return { id: insertData.id };
  } catch (error: any) {
    console.error("projects.createProject error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProject = async (authToken: string, id: string, projectData: ProjectUpdateBody): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const payload: any = { ...projectData };
    if ((projectData as any).location && (projectData as any).location.lat && (projectData as any).location.long) {
      payload.location = `(${(projectData as any).location.lat},${(projectData as any).location.long})`;
    }

    const { error } = await client
      .from("projects")
      .update(payload)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("projects.updateProject error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteProject = async (authToken: string, id: string): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("projects")
      .update({ is_soft_deleted: true })
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("projects.deleteProject error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
