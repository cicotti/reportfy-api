/**************************************************/
/*** Enums, Table and Indexes                   ***/
/**************************************************/

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  wbs VARCHAR(50),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 3), -- Maximum 3 levels
  name VARCHAR(500) NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  variance INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent_task_id ON public.project_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_wbs ON public.project_tasks(wbs);
CREATE INDEX IF NOT EXISTS idx_project_tasks_display_order ON public.project_tasks(project_id, display_order);

/**************************************************/
/*** Functions                                  ***/
/**************************************************/

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

/**************************************************/
/*** Security and Policies                      ***/
/**************************************************/

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL project_tasks" ON public.project_tasks
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own project_tasks" ON public.project_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  );

/**************************************************/
/*** Publications                               ***/
/**************************************************/

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
