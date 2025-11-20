import { createAuthenticatedClient, createAuthenticatedSaasClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ProjectListResult, ProjectInsertBody, ProjectUpdateBody, ProjectQuery } from '../schemas/projects.schema';
import { convertLocationToLatLong } from '@/lib/utils';
import { ApiError } from '../lib/errors';

export const fetchProjects = async (authToken: string, queryString?: ProjectQuery): Promise<ProjectListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    let query = client
      .from("projects")
      .select("*")
      .eq("is_soft_deleted", false)
      .order("name", { ascending: true });
    
    if (queryString) {
      if (queryString.project_id) {
        query = query.eq("id", queryString.project_id);
      }
      if (queryString.client_id) {
        query = query.eq("client_id", queryString.client_id);
      }
    }

    const { data, error } = await query;

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    const projects = (data || []) as any[];

    if (projects.length === 0) return [];

    const clientIds = Array.from(new Set(projects.map(p => p.client_id).filter(Boolean)));

    let clientsMap: Record<string, { name: string }> = {};
    if (clientIds.length > 0) {
      const saasClient = createAuthenticatedSaasClient(authToken);
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

    return projects.map((project) => {
      const location = convertLocationToLatLong(project.location);
      return {
        ...project,
        client: {
          id: project.client_id,
          name: clientsMap[project.client_id].name
        },
        location: location
      } as ProjectListResult;
    });
  } catch (error: any) {
    console.error("projects.fetchProjects error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createProject = async (authToken: string, data: ProjectInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedClient(authToken);
    const { data: { user }, error: userError } = await saasClient.auth.getUser();
    if (userError || !user) throw new ApiError("authentication", "Usuário não autenticado");
    
    const client = createAuthenticatedClient(authToken);

    const payload = {
      ...data,
      location: `(${data.location.lat},${data.location.long})`,
      created_by: user.id,
      created_at: new Date().toISOString()
    };

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
