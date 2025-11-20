/**************************************************/
/*** Enums, Table and Indexes                   ***/
/**************************************************/

CREATE TABLE public.informative_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES saas.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_mandatory BOOL NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE (company_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_informative_types_company_id ON public.informative_types(company_id);

/**************************************************/
/*** Functions                                  ***/
/**************************************************/

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON public.informative_types
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

/**************************************************/
/*** Security and Policies                      ***/
/**************************************************/

ALTER TABLE public.informative_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL informative_types" ON public.informative_types
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own informative_types" ON public.informative_types
  FOR ALL
  TO authenticated
  USING (          
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  );

/**************************************************/
/*** Publications                               ***/
/**************************************************/
