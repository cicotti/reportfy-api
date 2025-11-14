/*************************************************/
/*** Migração: Refatoração de Cálculos          **/
/*** Data: 2025-11-10                           **/
/*** Descrição: Implementa regras de negócio   ***/
/***   para cálculos de datas, variância e     ***/
/***   conclusão em tarefas, ancestrais e      ***/
/***   projetos de forma otimizada             ***/
/*************************************************/

/*************************************************/
/*** Função: Calcular Status do Projeto       ****/
/*** (Nível PROJETO)                           ***/
/*************************************************/

-- Function to determine project status based on dates and completion
CREATE OR REPLACE FUNCTION public.calculate_project_status(
    p_project_id UUID
)
RETURNS public.project_status AS $$
DECLARE
    v_project RECORD;
    v_avg_completion NUMERIC;
    v_today DATE := CURRENT_DATE;
    v_has_tasks BOOLEAN;
BEGIN
    -- Get project data
    SELECT 
        planned_start,
        planned_end,
        actual_start,
        actual_end,
        is_active
    INTO v_project
    FROM public.projects
    WHERE id = p_project_id;
    
    -- Check if project is inactive
    IF v_project.is_active = FALSE THEN
        RETURN 'inactive';
    END IF;
    
    -- Check if project is done (has actual_end date)
    IF v_project.actual_end IS NOT NULL THEN
        RETURN 'done';
    END IF;
    
    -- Check if project has started (has actual_start date)
    IF v_project.actual_start IS NOT NULL THEN
        -- Project has started, check if delayed
        IF v_project.planned_end IS NOT NULL AND v_today > v_project.planned_end THEN
            RETURN 'delayed';
        END IF;
        RETURN 'in_progress';
    END IF;
    
    -- Project hasn't started yet, check if it should have started
    IF v_project.planned_start IS NOT NULL AND v_today > v_project.planned_start THEN
        RETURN 'delayed';
    END IF;
    
    -- Check if project has tasks
    SELECT EXISTS(
        SELECT 1 FROM public.project_tasks 
        WHERE project_id = p_project_id
    ) INTO v_has_tasks;
    
    -- If no tasks and no dates, it's not started
    IF NOT v_has_tasks AND v_project.planned_start IS NULL THEN
        RETURN 'not_started';
    END IF;
    
    -- Project is planned but not started
    RETURN 'not_started';
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Função Principal: Calcular Métricas        ***/
/*** de Tarefas (Nível TAREFA)                  ***/
/**************************************************/

-- Esta função calcula a variância para uma tarefa individual
CREATE OR REPLACE FUNCTION public.calculate_task_variance(
  p_planned_start DATE,
  p_planned_end DATE,
  p_actual_start DATE,
  p_actual_end DATE
)
RETURNS INTEGER AS $$
BEGIN
  -- Variação = diferença entre a data planejada e a data real da tarefa
  -- Usando a data de fim como referência principal
  IF p_planned_end IS NOT NULL AND p_actual_end IS NOT NULL THEN
    RETURN p_actual_end - p_planned_end; -- Positivo = atrasado, Negativo = adiantado
  END IF;
  
  -- Se não houver data de fim, usar data de início
  IF p_planned_start IS NOT NULL AND p_actual_start IS NOT NULL THEN
    RETURN p_actual_start - p_planned_start;
  END IF;
  
  -- Se não houver datas reais, sem variação
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

/**************************************************/
/*** Função: Atualizar Métricas de Tarefa       ***/
/*** Ancestral (Nível ANCESTRAL)                ***/
/**************************************************/

-- Esta função recalcula todas as métricas de uma tarefa ancestral baseada em suas tarefas filhas diretas
CREATE OR REPLACE FUNCTION public.update_ancestor_task_metrics(p_task_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg_completion NUMERIC;
  v_min_planned_start DATE;
  v_max_planned_end DATE;
  v_min_actual_start DATE;
  v_max_actual_end DATE;
  v_all_children_have_actual_end BOOLEAN;
  v_variance INTEGER;
BEGIN
  -- Calcular métricas agregadas das tarefas filhas diretas
  SELECT 
    AVG(completion_percentage)::INTEGER,
    MIN(planned_start),
    MAX(planned_end),
    MIN(actual_start),
    MAX(actual_end)
  INTO 
    v_avg_completion,
    v_min_planned_start,
    v_max_planned_end,
    v_min_actual_start,
    v_max_actual_end
  FROM public.project_tasks
  WHERE parent_task_id = p_task_id;
  
  -- Verificar se todas as tarefas filhas diretas têm actual_end
  SELECT bool_and(actual_end IS NOT NULL) 
  INTO v_all_children_have_actual_end
  FROM public.project_tasks
  WHERE parent_task_id = p_task_id;

  -- Calcular variância do ancestral somente quando todas as filhas tiverem actual_end
  IF v_all_children_have_actual_end THEN
    v_variance := public.calculate_task_variance(
      v_min_planned_start,
      v_max_planned_end,
      v_min_actual_start,
      v_max_actual_end
    );
  ELSE
    v_variance := NULL;
    v_max_actual_end := NULL; -- não atribuir actual_end se nem todas as filhas tiverem
  END IF;
  
  -- Atualizar a tarefa ancestral
  UPDATE public.project_tasks
  SET 
    completion_percentage = COALESCE(v_avg_completion, 0),
    planned_start = v_min_planned_start,
    planned_end = v_max_planned_end,
    actual_start = v_min_actual_start,
    actual_end = v_max_actual_end,
    variance = v_variance,
    updated_at = now()
  WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Função: Atualizar Métricas do Projeto      ***/
/*** (Nível PROJETO)                            ***/
/**************************************************/

-- Esta função recalcula todas as métricas de um projeto baseado em suas tarefas filhas diretas (level 1)
CREATE OR REPLACE FUNCTION public.update_project_metrics(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg_completion NUMERIC;
  v_min_planned_start DATE;
  v_max_planned_end DATE;
  v_min_actual_start DATE;
  v_max_actual_end DATE;
  v_variance INTEGER;
  v_status public.project_status;
  v_all_level1_have_actual_end BOOLEAN;
BEGIN
  -- Calcular métricas agregadas das tarefas filhas diretas do projeto (level 1)
  SELECT 
    AVG(completion_percentage)::INTEGER,
    MIN(planned_start),
    MAX(planned_end),
    MIN(actual_start),
    MAX(actual_end)
  INTO 
    v_avg_completion,
    v_min_planned_start,
    v_max_planned_end,
    v_min_actual_start,
    v_max_actual_end
  FROM public.project_tasks
  WHERE project_id = p_project_id 
    AND parent_task_id IS NULL; -- Apenas tarefas de nível 1 (filhas diretas do projeto)
  
  -- Verificar se todas as tarefas filhas diretas do projeto (level 1) têm actual_end
  SELECT bool_and(actual_end IS NOT NULL) INTO v_all_level1_have_actual_end
  FROM public.project_tasks
  WHERE project_id = p_project_id AND parent_task_id IS NULL;

  -- Calcular variância do projeto somente quando todas as level-1 tiverem actual_end
  IF v_all_level1_have_actual_end THEN
    v_variance := public.calculate_task_variance(
      v_min_planned_start,
      v_max_planned_end,
      v_min_actual_start,
      v_max_actual_end
    );
  ELSE
    v_variance := NULL;
    v_max_actual_end := NULL; -- não atribuir actual_end se nem todas as filhas tiverem
  END IF;
  
  -- Calcular status do projeto
  v_status := public.calculate_project_status(p_project_id);
  
  -- Atualizar o projeto
  UPDATE public.projects
  SET 
    completion_percentage = COALESCE(v_avg_completion, 0),
    planned_start = v_min_planned_start,
    planned_end = v_max_planned_end,
    actual_start = v_min_actual_start,
    actual_end = v_max_actual_end,
    variance = v_variance,
    status = v_status,
    updated_at = now()
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Função: Propagar Atualizações na           ***/
/*** Hierarquia (Bottom-Up)                     ***/
/**************************************************/

-- Esta função propaga as mudanças de uma tarefa para cima na hierarquia
CREATE OR REPLACE FUNCTION public.propagate_task_changes(p_task_id UUID)
RETURNS VOID AS $$
DECLARE
  v_parent_task_id UUID;
  v_project_id UUID;
  v_current_task_id UUID;
BEGIN
  -- Obter informações da tarefa
  SELECT parent_task_id, project_id
  INTO v_parent_task_id, v_project_id
  FROM public.project_tasks
  WHERE id = p_task_id;
  
  -- Propagar para cima na hierarquia de tarefas
  v_current_task_id := v_parent_task_id;
  
  WHILE v_current_task_id IS NOT NULL LOOP
    -- Atualizar métricas do ancestral
    PERFORM public.update_ancestor_task_metrics(v_current_task_id);
    
    -- Subir mais um nível
    SELECT parent_task_id INTO v_current_task_id
    FROM public.project_tasks
    WHERE id = v_current_task_id;
  END LOOP;
  
  -- Atualizar métricas do projeto
  PERFORM public.update_project_metrics(v_project_id);
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Trigger: Calcular Variância de Tarefa      ***/
/*** Individual e Auto-Completar                ***/
/**************************************************/

-- Trigger para calcular variância e auto-completar quando tarefas individuais são criadas/atualizadas
CREATE OR REPLACE FUNCTION public.trigger_calculate_task_variance()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-completar tarefa quando actual_end é definido
  -- Se actual_end está sendo definido (e não estava antes), definir completion para 100%
  IF NEW.actual_end IS NOT NULL AND (OLD IS NULL OR OLD.actual_end IS NULL OR OLD.actual_end IS DISTINCT FROM NEW.actual_end) THEN
    NEW.completion_percentage := 100;
  END IF;
  
  -- Calcular variância para tarefas
  -- Para tarefas ancestrais, a variância será recalculada pela função update_ancestor_task_metrics
  NEW.variance := public.calculate_task_variance(
    NEW.planned_start,
    NEW.planned_end,
    NEW.actual_start,
    NEW.actual_end
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Trigger: Propagar Mudanças                 ***/
/**************************************************/

-- Trigger para propagar mudanças após INSERT/UPDATE/DELETE de tarefas
CREATE OR REPLACE FUNCTION public.trigger_propagate_task_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_task_id UUID;
  v_project_id UUID;
BEGIN
  -- Determinar qual tarefa e projeto usar baseado na operação
  IF TG_OP = 'DELETE' THEN
    v_task_id := OLD.id;
    v_project_id := OLD.project_id;
  ELSE
    v_task_id := NEW.id;
    v_project_id := NEW.project_id;
  END IF;
  
  -- Propagar mudanças para cima na hierarquia
  PERFORM public.propagate_task_changes(v_task_id);
  
  -- Retornar valor apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Criar Novos Triggers                       ***/
/**************************************************/

-- Trigger para calcular variância antes de INSERT/UPDATE
CREATE TRIGGER trigger_calculate_task_variance
  BEFORE INSERT OR UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_calculate_task_variance();

-- Trigger para propagar mudanças após INSERT de tarefa
CREATE TRIGGER trigger_propagate_on_insert
  AFTER INSERT ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_propagate_task_changes();

-- Trigger para propagar mudanças após UPDATE de tarefa
-- Apenas dispara se campos relevantes mudarem
CREATE TRIGGER trigger_propagate_on_update
  AFTER UPDATE ON public.project_tasks
  FOR EACH ROW
  WHEN (
    NEW.completion_percentage IS DISTINCT FROM OLD.completion_percentage OR
    NEW.planned_start IS DISTINCT FROM OLD.planned_start OR
    NEW.planned_end IS DISTINCT FROM OLD.planned_end OR
    NEW.actual_start IS DISTINCT FROM OLD.actual_start OR
    NEW.actual_end IS DISTINCT FROM OLD.actual_end OR
    NEW.parent_task_id IS DISTINCT FROM OLD.parent_task_id
  )
  EXECUTE FUNCTION public.trigger_propagate_task_changes();

-- Trigger para propagar mudanças após DELETE de tarefa
CREATE TRIGGER trigger_propagate_on_delete
  AFTER DELETE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_propagate_task_changes();


/**************************************************/
/*** Comentários e Documentação                 ***/
/**************************************************/

COMMENT ON FUNCTION public.calculate_task_variance IS 
'Calcula a variância entre datas planejadas e reais. Retorna NULL se não houver datas reais. Positivo = atrasado, Negativo = adiantado.';

COMMENT ON FUNCTION public.update_ancestor_task_metrics IS 
'Atualiza todas as métricas de uma tarefa ancestral baseado em suas tarefas filhas diretas: % conclusão (média), datas (min/max).\nFim Real (actual_end) é definido como o maior actual_end apenas quando todas as tarefas filhas diretas possuem actual_end.';

COMMENT ON FUNCTION public.update_project_metrics IS 
'Atualiza todas as métricas de um projeto baseado em suas tarefas filhas diretas (level 1): % conclusão (média), datas (min/max) e status.\nFim Real (actual_end) do projeto é definido como o maior actual_end entre as tarefas level-1 somente quando todas as tarefas level-1 possuem actual_end; caso contrário, actual_end/variância serão NULL.';

COMMENT ON FUNCTION public.propagate_task_changes IS 
'Propaga mudanças de uma tarefa para cima na hierarquia, atualizando todos os ancestrais e o projeto.';

COMMENT ON FUNCTION public.trigger_calculate_task_variance IS 
'Calcula a variância da tarefa e auto-completa em 100% quando actual_end é definido.';
