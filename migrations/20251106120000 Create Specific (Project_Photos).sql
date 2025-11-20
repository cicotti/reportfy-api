/**************************************************/
/*** Enums, Table and Indexes                   ***/
/**************************************************/

CREATE TABLE public.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_project_photos_project_id ON public.project_photos(project_id);
CREATE INDEX idx_project_photos_display_order ON public.project_photos(project_id, display_order);

-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO NOTHING;


/**************************************************/
/*** Functions                                  ***/
/**************************************************/

/**************************************************/
/*** Triggers                                   ***/
/**************************************************/

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON public.project_photos
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

/**************************************************/
/*** Security and Policies                      ***/
/**************************************************/

ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL project photos" ON public.project_photos
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own project photos" ON public.project_photos
  FOR ALL
  TO authenticated
  USING (          
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_photos.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_photos.project_id
      AND p.company_id IN (
        SELECT company_id FROM saas.profiles
        WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for storage.objects (project-photos bucket)
CREATE POLICY "Users can manage ALL project photos" ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'project-photos'
    AND auth.uid() IS NOT NULL
  );

/**************************************************/
/*** Publications                               ***/
/**************************************************/

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_photos;
