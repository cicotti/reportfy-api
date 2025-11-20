/**************************************************/
/*** Enums, Table and Indexes                   ***/
/**************************************************/

CREATE TABLE public.project_weathers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  weather_date DATE NOT NULL,
  min_temperature INT NOT NULL,
  max_temperature INT NOT NULL,
  climate TEXT NOT NULL,
  is_prediction BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE (project_id, weather_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_weathers_project_id ON public.project_weathers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_weathers_weather_date ON public.project_weathers(weather_date);
CREATE INDEX IF NOT EXISTS idx_project_weathers_is_prediction ON public.project_weathers(is_prediction);

/**************************************************/
/*** Functions                                  ***/
/**************************************************/

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON public.project_weathers
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

/**************************************************/
/*** Security and Policies                      ***/
/**************************************************/

ALTER TABLE public.project_weathers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL project_weathers" ON public.project_weathers
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own project_weathers" ON public.project_weathers
  FOR ALL
  TO authenticated
  USING (          
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_weathers.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_weathers.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  );

/**************************************************/
/*** Publications                               ***/
/**************************************************/
