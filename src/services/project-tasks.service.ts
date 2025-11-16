import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ProjectTaskListResult, ProjectTaskInsertBody, ProjectTaskUpdateBody, ProjectTaskDeleteBody } from '../schemas/project-tasks.schema';
import { ApiError } from '../lib/errors';

export const fetchProjectTasks = async (authToken: string, projectId: string): Promise<ProjectTaskListResult[]> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const { data, error } = await client
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("display_order", { ascending: true });
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data || []) as ProjectTaskListResult[];
  } catch (error: any) {
    console.error("project-tasks.fetchProjectTasks error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const createProjectTask = async (authToken: string, data: ProjectTaskInsertBody): Promise<{ id: string }> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const { data: result, error } = await client
      .from("project_tasks")
      .insert([data])
      .select("id")
      .single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return { id: result!.id };
  } catch (error: any) {
    console.error("project-tasks.createProjectTask error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProjectTask = async (authToken: string, data: ProjectTaskUpdateBody): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("project_tasks")
      .update(data)
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-tasks.updateProjectTask error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteProjectTask = async (authToken: string, data: ProjectTaskDeleteBody): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const { error } = await client
      .from("project_tasks")
      .delete()
      .eq("id", data.id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-tasks.deleteProjectTask error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
