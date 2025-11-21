/**************************************************/
/*** Enums, Table and Indexes                   ***/
/**************************************************/

CREATE TYPE public.project_status AS ENUM ('inactive', 'not_started', 'in_progress', 'delayed', 'done');

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES saas.companies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES saas.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location POINT NOT NULL,
  status project_status DEFAULT 'not_started',
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  variance INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_soft_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ
);

/**************************************************/
/*** Functions                                  ***/
/**************************************************/

CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
BEGIN
  -- Insere um registro em project_informatives para cada informative_type da mesma empresa
  INSERT INTO public.project_informatives (project_id, informative_type_id, created_by, created_at)
  SELECT
    NEW.id AS project_id,
    it.id AS informative_type_id,
    NEW.created_by AS created_by,
    now() AS created_at
  FROM public.informative_types it
  WHERE it.company_id = NEW.company_id
  ORDER BY it.display_order;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

CREATE OR REPLACE TRIGGER handle_new_project
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_project();

/**************************************************/
/*** Security and Policies                      ***/
/**************************************************/

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL projects" ON public.projects
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own projects" ON public.projects
  FOR ALL
  TO authenticated
  USING (          
    company_id = (SELECT company_id FROM saas.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM saas.profiles WHERE id = auth.uid())
  );

/**************************************************/
/*** Publications                               ***/
/**************************************************/

ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
