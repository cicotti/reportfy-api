import { createAuthenticatedClient, createAuthenticatedSaasClient } from '@/lib/supabase';
import { ApplicationError } from '@/lib/errors';

export interface Project {
  id: string;
  company_id: string;
  client_id: string;
  name: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string | null;
  actual_end?: string | null;
  week_day_report?: number;
  address: string;
  location: string;
  status: string;
  is_active: boolean;
  is_soft_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ProjectWithClient extends Project {
  client_name?: string;
  location_lat?: string;
  location_long?: string;
}

export interface ProjectFormData {
  client_id: string;
  name: string;
  planned_start: string;
  planned_end: string;
  week_day_report?: number;
  address: string;
  location: { lat: string; long: string };
  is_active: boolean;
}

export async function fetchProjects(authToken: string, clientId?: string): Promise<ProjectWithClient[]> {
  try {
    const client = createAuthenticatedClient(authToken);
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    let query = client
      .from("projects")
      .select("*")
      .eq("is_soft_deleted", false)
      .order("name");

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApplicationError("Erro ao buscar projetos", error.message, true);
    }

    const projects = (data || []) as any[];

    if (projects.length === 0) return [];

    const clientIds = Array.from(new Set(projects.map(p => p.client_id).filter(Boolean)));

    let clientsMap: Record<string, { name: string }> = {};
    if (clientIds.length > 0) {
      const { data: clientsData, error: clientsError } = await saasClient
        .from("clients")
        .select("id, name")
        .in("id", clientIds);

      if (!clientsError && clientsData) {
        clientsMap = (clientsData as any[]).reduce((acc, c) => {
          acc[c.id] = { name: c.name };
          return acc;
        }, {} as Record<string, { name: string }>);
      }
    }

    const projectsWithData: ProjectWithClient[] = projects.map((project) => {
      let location_lat: string | undefined;
      let location_long: string | undefined;
      if (project.location && typeof project.location === "string") {
        const raw = project.location.replace(/[()]/g, "");
        const parts = raw.split(",");
        if (parts.length >= 2) {
          location_lat = parts[0];
          location_long = parts[1];
        }
      }

      return {
        ...project,
        client_name: clientsMap[project.client_id]?.name || "",
        location_lat,
        location_long,
      } as ProjectWithClient;
    });

    return projectsWithData;
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    console.error("Error fetching projects:", error);
    throw new ApplicationError("Erro ao carregar projetos", "Não foi possível carregar os projetos", true);
  }
}

export async function fetchProject(authToken: string, projectId: string): Promise<ProjectWithClient | null> {
  try {
    const client = createAuthenticatedClient(authToken);
    const saasClient = createAuthenticatedSaasClient(authToken);
    
    const { data, error } = await client
      .from("projects")
      .select(`*`)
      .eq("id", projectId)
      .eq("is_soft_deleted", false)
      .single();

    if (error) {
      throw new ApplicationError("Erro ao buscar projeto", error.message, true);
    }

    if (!data) return null;

    let clientName = "";
    if ((data as any).client_id) {
      try {
        const { data: clientData, error: clientError } = await saasClient
          .from("clients")
          .select("name")
          .eq("id", (data as any).client_id)
          .single();

        if (!clientError && clientData) {
          clientName = (clientData as any).name || "";
        }
      } catch (err) {
        console.error("Erro ao buscar client:", err);
      }
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
    } as ProjectWithClient;
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    console.error("Error fetching project:", error);
    throw new ApplicationError("Erro ao carregar projeto", "Não foi possível carregar o projeto", true);
  }
}

export async function createProject(authToken: string, projectData: ProjectFormData & { company_id: string }): Promise<void> {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const payload: any = { ...projectData };
    if (projectData.location && projectData.location.lat && projectData.location.long) {
      payload.location = `(${projectData.location.lat},${projectData.location.long})`;
    } else {
      payload.location = `(0,0)`;
    }

    const { error } = await client.from("projects").insert([payload] as any);

    if (error) {
      throw new ApplicationError("Erro ao criar projeto", error.message, true);
    }
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    console.error("Error creating project:", error);
    throw new ApplicationError("Erro ao criar projeto", "Não foi possível criar o projeto", true);
  }
}

export async function updateProject(authToken: string, id: string, projectData: Partial<ProjectFormData>): Promise<void> {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const payload: any = { ...projectData };
    if ((projectData as any).location && (projectData as any).location.lat && (projectData as any).location.long) {
      payload.location = `(${(projectData as any).location.lat},${(projectData as any).location.long})`;
    }

    const { error } = await client.from("projects").update(payload as any).eq("id", id);

    if (error) {
      throw new ApplicationError("Erro ao atualizar projeto", error.message, true);
    }
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    console.error("Error updating project:", error);
    throw new ApplicationError("Erro ao atualizar projeto", "Não foi possível atualizar o projeto", true);
  }
}

export async function softDeleteProject(authToken: string, id: string): Promise<void> {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("projects")
      .update({ is_soft_deleted: true })
      .eq("id", id);

    if (error) {
      throw new ApplicationError("Erro ao excluir projeto", error.message, true);
    }
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    console.error("Error deleting project:", error);
    throw new ApplicationError("Erro ao excluir projeto", "Não foi possível excluir o projeto", true);
  }
}
