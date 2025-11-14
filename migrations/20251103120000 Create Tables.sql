-- Create ENUM types
CREATE TYPE saas.app_role AS ENUM ('admin', 'super_user', 'user');
CREATE TYPE saas.subscription_plan AS ENUM ('basic', 'professional', 'enterprise');

-- Create TABLES
CREATE TABLE saas.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  language TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);

CREATE TABLE saas.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  telephone TEXT NOT NULL,
  plan saas.subscription_plan DEFAULT 'basic' NOT NULL,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_soft_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE(document)
);

CREATE TABLE saas.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE cascade NOT NULL,
  company_id UUID REFERENCES saas.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE(email)
);

CREATE TABLE saas.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES saas.profiles(id) ON DELETE CASCADE NOT NULL,
  role saas.app_role NOT NULL DEFAULT 'user',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE saas.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES saas.profiles(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  marketing_emails BOOLEAN DEFAULT false NOT NULL,
  theme TEXT DEFAULT 'system' NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id) 
);

CREATE TABLE saas.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES saas.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  document TEXT,
  telephone TEXT,
  contact TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_soft_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  UNIQUE(company_id, document)
);