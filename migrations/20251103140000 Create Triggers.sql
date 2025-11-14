-- Create trigger function to handle new user creation

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_new_user();

-- Add trigger for updated_at

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON saas.companies
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON saas.profiles
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON saas.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();

CREATE OR REPLACE TRIGGER handle_record_updated
  BEFORE UPDATE ON saas.clients
  FOR EACH ROW
  EXECUTE FUNCTION saas.handle_updated();