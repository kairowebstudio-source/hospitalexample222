-- Create trigger to add patient role and record when user confirms email
-- This handles the case where signup requires email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only act when email gets confirmed (old was unconfirmed, new is confirmed)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Check if user already has a role (e.g., doctor/admin created by admin)
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
      -- Add patient role
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
      -- Create patient record
      INSERT INTO public.patients (user_id) VALUES (NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmed();