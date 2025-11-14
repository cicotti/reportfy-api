/**************************************************/
/*** Check if TENANT is active                  ***/
/**************************************************/

CREATE OR REPLACE FUNCTION saas.is_active_tenant(_user_id uuid)
RETURNS BOOL
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = saas
AS $$
DECLARE
  id UUID;
  role TEXT;
  is_active BOOL;
BEGIN
  SELECT p.id, ur.role, c.is_active
  INTO id, role, is_active
  FROM saas.profiles p 
  LEFT JOIN saas.companies c ON (p.company_id = c.id) 
  LEFT JOIN saas.user_roles ur on (p.id = ur.user_id)
  WHERE p.id = _user_id;
  
  IF (id IS NOT NULL AND (is_active OR role = 'admin')) THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

/**************************************************/
/*** Check if EMAIL or company DOCUMENT exists  ***/
/**************************************************/

CREATE OR REPLACE FUNCTION saas.has_account_created(_search TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = saas
AS $$
BEGIN
  IF (_search LIKE '%@%') THEN
    RETURN EXISTS (
      SELECT 1
      FROM saas.profiles
      WHERE email = _search
    );
  ELSE
    RETURN EXISTS (
      SELECT 1
      FROM saas.companies
      WHERE document = _search
    );
  END IF;
END;
$$;

/**************************************************/
/*** Update timestamps and user tracking        ***/
/**************************************************/

CREATE OR REPLACE FUNCTION saas.handle_updated()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = saas AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

/**************************************************/
/*** Create NEW USER during signup              ***/
/**************************************************/

CREATE OR REPLACE FUNCTION saas.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql SECURITY definer SET search_path = saas AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Check whether the company exists or needs to be created
  SELECT id FROM saas.companies WHERE document = NEW.raw_user_meta_data->>'company_document' INTO new_company_id;
  
  -- Insert default company
  IF new_company_id IS NULL THEN    
    INSERT INTO saas.companies (name, document, telephone, created_by, created_at)
    VALUES (
      NEW.raw_user_meta_data->>'company_name', 
      NEW.raw_user_meta_data->>'company_document', 
      NEW.raw_user_meta_data->>'company_telephone',
      NEW.id,
      NOW()
    )
    RETURNING id INTO new_company_id;
  END IF;
  
  -- Insert profile
  INSERT INTO saas.profiles (id, company_id, email, name, created_by, created_at)
  VALUES (
    NEW.id,
    new_company_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.id,
    NOW()
  );
  
  -- Insert default user role
  INSERT INTO saas.user_roles (user_id, role, created_by, created_at)
  VALUES (
    NEW.id,
    'user',
    NEW.id,
    NOW()
  );
  
  -- Insert default settings
  INSERT INTO saas.user_settings (user_id, created_by, created_at)
  VALUES (
    NEW.id,
    NEW.id,
    NOW()
  );
  
  RETURN NEW;
END;
$$;

/**************************************************/
/*** RLS: Check if user has a specific role     ***/
/**************************************************/

CREATE OR REPLACE FUNCTION saas.has_role(_user_id UUID, _role saas.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = saas
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM saas.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

/**************************************************/
/*** RLS: Check companies between users         ***/
/**************************************************/

CREATE OR REPLACE FUNCTION saas.is_same_company(_user_a uuid, _user_b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = saas
AS $$
  SELECT ((SELECT company_id FROM saas.profiles WHERE id = _user_a)
    IS NOT DISTINCT FROM
    (SELECT company_id FROM saas.profiles WHERE id = _user_b));
$$;