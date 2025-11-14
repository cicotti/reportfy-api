CREATE SCHEMA saas AUTHORIZATION pg_database_owner;

-- Permissão de uso do schema (necessária para acessar objetos dentro do schema)
GRANT USAGE ON SCHEMA saas TO anon;
GRANT USAGE ON SCHEMA saas TO authenticated;

-- Permissões sobre tabelas existentes
-- Permitir SELECT para anon (leitura pública)
GRANT SELECT ON ALL TABLES IN SCHEMA saas TO anon;

-- Permitir SELECT/INSERT/UPDATE/DELETE para users autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA saas TO authenticated;

-- Permissões sobre sequences (se houver sequences usadas por tabelas)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA saas TO authenticated;
-- normalmente anon não precisa de uso de sequences, mas se precisar:
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA saas TO anon;

-- Permissões sobre funções (RPCs) do schema saas
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA saas TO authenticated;
-- Se as funções precisam ser acessíveis por chamadas anônimas, descomente:
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA saas TO anon;

-- Define privilégios padrões para objetos que serão criados no futuro
-- (esse comando afeta objetos criados pelo mesmo role que executar este ALTER DEFAULT PRIVILEGES)
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT EXECUTE ON FUNCTIONS TO authenticated;
-- Se quiser permitir execuções anônimas por padrão (use com cuidado):
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT EXECUTE ON FUNCTIONS TO anon;
