/**************************************************/
/*** Policies for TRANSLATIONS table            ***/
/**************************************************/

ALTER TABLE saas.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ANYONE can SELECT all translations" ON saas.translations
  FOR SELECT
  USING (true);

/**************************************************/
/*** Policies for COMPANIES table               ***/
/**************************************************/

ALTER TABLE saas.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL companies" ON saas.companies
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "SUPER USER can manage ALL its own company" ON saas.companies
  FOR ALL
  TO authenticated
  USING (    
    saas.has_role(auth.uid(), 'super_user'::saas.app_role)
    AND (id = (SELECT company_id FROM saas.profiles WHERE id = auth.uid()))
  )
  WITH CHECK (
    saas.has_role(auth.uid(), 'super_user'::saas.app_role)
    AND (id = (SELECT company_id FROM saas.profiles WHERE id = auth.uid()))
  );

/**************************************************/
/*** Policies for PROFILES table                ***/
/**************************************************/

ALTER TABLE saas.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL profiles" ON saas.profiles
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own profiles" ON saas.profiles
  FOR ALL
  TO authenticated
  USING (
    (
      saas.has_role(auth.uid(), 'super_user'::saas.app_role)
      AND saas.is_same_company(auth.uid(), id)
    ) OR (      
      id = auth.uid()      
    )
  )
  WITH CHECK (
    (
      saas.has_role(auth.uid(), 'super_user'::saas.app_role)
      AND saas.is_same_company(auth.uid(), id)
    ) OR (      
      id = auth.uid()
    )
  );

/**************************************************/
/*** Policies for USER_ROLES table              ***/
/**************************************************/

ALTER TABLE saas.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL user_roles" ON saas.user_roles
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own user_roles" ON saas.user_roles
  FOR ALL
  TO authenticated
  USING (
    (
      saas.has_role(auth.uid(), 'super_user'::saas.app_role)
      AND saas.is_same_company(user_id, auth.uid())
    ) OR (
      user_id = auth.uid()
    )
  )
  WITH CHECK (
    (
      saas.has_role(auth.uid(), 'super_user'::saas.app_role)
      AND saas.is_same_company(user_id, auth.uid())
    ) OR (
      user_id = auth.uid()
    )
  );

/**************************************************/
/*** Policies for USER_SETTINGS table           ***/
/**************************************************/

ALTER TABLE saas.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL user_settings" ON saas.user_settings
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own user_settings" ON saas.user_settings
  FOR ALL
  TO authenticated
  USING (
    (
      saas.has_role(auth.uid(), 'super_user'::saas.app_role)
      AND saas.is_same_company(user_id, auth.uid())
    ) OR (
      user_id = auth.uid()
    )
  )
  WITH CHECK (
    (
      saas.has_role(auth.uid(), 'super_user'::saas.app_role)
      AND saas.is_same_company(user_id, auth.uid())
    ) OR (
      user_id = auth.uid()
    )
  );

/**************************************************/
/*** Policies for CLIENTS table                 ***/
/**************************************************/

ALTER TABLE saas.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ADMIN can manage ALL clients" ON saas.clients
  FOR ALL
  TO authenticated
  USING (saas.has_role(auth.uid(), 'admin'::saas.app_role))
  WITH CHECK (saas.has_role(auth.uid(), 'admin'::saas.app_role));

CREATE POLICY "ANYONE can manage ALL its own clients" ON saas.clients
  FOR ALL
  TO authenticated
  USING (
    company_id = (SELECT company_id FROM saas.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM saas.profiles WHERE id = auth.uid())
  );