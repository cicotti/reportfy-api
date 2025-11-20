import { createAuthenticatedClient } from '../lib/supabase';
import { translateErrorCode } from 'supabase-error-translator-js';
import { ProjectTaskListResult, ProjectTaskInsertBody, ProjectTaskUpdateBody, ProjectTaskDeleteBody, ProjectTaskQuery } from '../schemas/project-tasks.schema';
import { ApiError } from '../lib/errors';

export const fetchProjectTasks = async (authToken: string, queryString?: ProjectTaskQuery): Promise<ProjectTaskListResult[]> => {
  try {
    if (queryString?.project_id === undefined) {
      throw new ApiError("validation", "O parâmetro 'project_id' é obrigatório");
    }

    const client = createAuthenticatedClient(authToken);
    
    let query = client
      .from("project_tasks")
      .select("*")
      .order("wbs", { ascending: true });
    
    if (queryString.task_id) {
      query = query.eq("id", queryString.task_id);
    }
    
    if (queryString.project_id) {
      query = query.eq("project_id", queryString.project_id);
    }

    const { data, error } = await query;
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return (data || []) as ProjectTaskListResult[];
  } catch (error: any) {
    console.error("project-tasks.fetchProjectTasks error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

const getMaxDisplayOrder = async (authToken: string, task: any): Promise<number> => {
  try {
    const client = createAuthenticatedClient(authToken);

    // Calculate display_order to add as last item within parent
    let displayOrder = 0;

    if (task.parent_task_id) {
      // Get max display_order among siblings (same parent)
      const { data: siblings, error: siblingsError } = await client
        .from("project_tasks")
        .select("display_order")
        .eq("project_id", task.project_id)
        .eq("parent_task_id", task.parent_task_id)
        .order("display_order", { ascending: false })
        .limit(1);
      
      if (siblingsError) {
        console.error("Error fetching siblings:", siblingsError);
        throw new ApiError("query", translateErrorCode(siblingsError.code, "database", "pt"));
      }
      
      displayOrder = siblings && siblings.length > 0 ? siblings[0].display_order + 1 : 0;
    } else {
      // Get max display_order among root tasks (no parent)
      const { data: rootTasks, error: rootError } = await client
        .from("project_tasks")
        .select("display_order")
        .eq("project_id", task.project_id)
        .is("parent_task_id", null)
        .order("display_order", { ascending: false })
        .limit(1);
      
      if (rootError) {
        console.error("Error fetching root tasks:", rootError);
        throw new ApiError("query", translateErrorCode(rootError.code, "database", "pt"));
      }
      
      displayOrder = rootTasks && rootTasks.length > 0 ? rootTasks[0].display_order + 1 : 0;      
    }
    return displayOrder;    
  } catch (error: any) {
    console.error("project-tasks.getMaxDisplayOrder error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};


export const createProjectTask = async (authToken: string, data: ProjectTaskInsertBody): Promise<{ id: string }> => {
  try {
    const saasClient = createAuthenticatedClient(authToken);
    const { data: { user }, error: userError } = await saasClient.auth.getUser();
    if (userError || !user) throw new ApiError("authentication", "Usuário não autenticado");

    const client = createAuthenticatedClient(authToken);

    const payload = { 
      ...data,
      display_order: await getMaxDisplayOrder(authToken, data),
      created_by: user.id,
      created_at: new Date().toISOString()
    };
    
    const { data: result, error } = await client
      .from("project_tasks")
      .insert([payload])
      .select("id")
      .single();
    
    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));

    return { id: result!.id };
  } catch (error: any) {
    console.error("project-tasks.createProjectTask error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const updateProjectTask = async (authToken: string, id: string, taskData: Partial<ProjectTaskUpdateBody>): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    
    const { error } = await client
      .from("project_tasks")
      .update(taskData)
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-tasks.updateProjectTask error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};

export const deleteProjectTask = async (authToken: string, id: string): Promise<void> => {
  try {
    const client = createAuthenticatedClient(authToken);
    const { error } = await client
      .from("project_tasks")
      .delete()
      .eq("id", id);

    if (error) throw new ApiError("query", translateErrorCode(error.code, "database", "pt"));
  } catch (error: any) {
    console.error("project-tasks.deleteProjectTask error:", error);
    throw new ApiError(error.type ?? "critical", error.message ?? "Erro inesperado");
  }
};
