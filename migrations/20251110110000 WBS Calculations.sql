/**************************************************/
/*** Functions                                  ***/
/**************************************************/

-- Function to automatically generate WBS (EDT) based on hierarchy
CREATE OR REPLACE FUNCTION public.generate_wbs(
  p_project_id UUID,
  p_parent_task_id UUID,
  p_display_order INTEGER
)
RETURNS VARCHAR AS $$
DECLARE
  v_parent_wbs VARCHAR;
  v_sibling_count INTEGER;
  v_new_wbs VARCHAR;
BEGIN
  -- If no parent, this is a root task
  IF p_parent_task_id IS NULL THEN
    -- Count existing root tasks for this project
    SELECT COUNT(*) INTO v_sibling_count
    FROM public.project_tasks
    WHERE project_id = p_project_id AND parent_task_id IS NULL;
    
    v_new_wbs := (v_sibling_count + 1)::VARCHAR;
  ELSE
    -- Get parent WBS
    SELECT wbs INTO v_parent_wbs
    FROM public.project_tasks
    WHERE id = p_parent_task_id;
    
    -- Count existing child tasks for this parent
    SELECT COUNT(*) INTO v_sibling_count
    FROM public.project_tasks
    WHERE parent_task_id = p_parent_task_id;
    
    v_new_wbs := v_parent_wbs || '.' || (v_sibling_count + 1)::VARCHAR;
  END IF;
  
  RETURN v_new_wbs;
END;
$$ LANGUAGE plpgsql;

-- Function to get task level
CREATE OR REPLACE FUNCTION public.get_task_level(p_parent_task_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_parent_level INTEGER;
BEGIN
  IF p_parent_task_id IS NULL THEN
    RETURN 1;
  END IF;
  
  SELECT level INTO v_parent_level
  FROM public.project_tasks
  WHERE id = p_parent_task_id;
  
  RETURN COALESCE(v_parent_level, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate WBS and level before insert
CREATE OR REPLACE FUNCTION public.auto_generate_task_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate WBS if not provided
  IF NEW.wbs IS NULL OR NEW.wbs = '' THEN
    NEW.wbs := public.generate_wbs(NEW.project_id, NEW.parent_task_id, NEW.display_order);
  END IF;
  
  -- Auto-calculate level
  NEW.level := public.get_task_level(NEW.parent_task_id);
  
  -- Validate maximum level
  IF NEW.level > 3 THEN
    RAISE EXCEPTION 'Maximum task hierarchy level is 3';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate WBS for all tasks in a project (useful after reordering)
CREATE OR REPLACE FUNCTION public.recalculate_project_wbs(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  v_task RECORD;
  v_counter INTEGER;
  v_parent_wbs VARCHAR;
BEGIN
  -- Update root level tasks
  v_counter := 0;
  FOR v_task IN 
    SELECT id FROM public.project_tasks
    WHERE project_id = p_project_id AND parent_task_id IS NULL 
    ORDER BY display_order
  LOOP
    v_counter := v_counter + 1;
    UPDATE public.project_tasks SET wbs = v_counter::VARCHAR WHERE id = v_task.id;
  END LOOP;
  
  -- Update level 2 tasks
  FOR v_task IN 
    SELECT t.id, t.parent_task_id, p.wbs as parent_wbs,
       ROW_NUMBER() OVER (PARTITION BY t.parent_task_id ORDER BY t.display_order) as rn
    FROM public.project_tasks t
    JOIN public.project_tasks p ON t.parent_task_id = p.id
    WHERE t.project_id = p_project_id AND t.level = 2
    ORDER BY t.parent_task_id, t.display_order
  LOOP
    UPDATE public.project_tasks
    SET wbs = v_task.parent_wbs || '.' || v_task.rn::VARCHAR 
    WHERE id = v_task.id;
  END LOOP;
  
  -- Update level 3 tasks
  FOR v_task IN 
    SELECT t.id, t.parent_task_id, p.wbs as parent_wbs,
       ROW_NUMBER() OVER (PARTITION BY t.parent_task_id ORDER BY t.display_order) as rn
    FROM public.project_tasks t
    JOIN public.project_tasks p ON t.parent_task_id = p.id
    WHERE t.project_id = p_project_id AND t.level = 3
    ORDER BY t.parent_task_id, t.display_order
  LOOP
    UPDATE public.project_tasks
    SET wbs = v_task.parent_wbs || '.' || v_task.rn::VARCHAR 
    WHERE id = v_task.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE TRIGGER auto_generate_task_metadata
  BEFORE INSERT ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_task_metadata();
