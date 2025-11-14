/**************************************************/
/*** Enums, Table and Indexes                   ***/
/**************************************************/

CREATE TABLE public.project_informatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  informative_type_id UUID REFERENCES public.informative_types(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE (project_id, informative_type_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_informatives_project_id ON public.project_informatives(project_id);
CREATE INDEX IF NOT EXISTS idx_project_informatives_informative_type_id ON public.project_informatives(informative_type_id);

/**************************************************/
/*** Functions                                  ***/
/**************************************************/

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE TRIGGER handle_record_updated
  BEFORE UPDATE ON public.project_informatives
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

/**************************************************/
/*** Security and Policies                      ***/
/**************************************************/

ALTER TABLE public.project_informatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL informatives" ON public.project_informatives
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own project informatives" ON public.project_informatives
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_informatives.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_informatives.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  );

/**************************************************/
/*** Publications                               ***/
/**************************************************/

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_informatives;

/**************************************************/
/*** Initial Dataload                           ***/
/**************************************************/

