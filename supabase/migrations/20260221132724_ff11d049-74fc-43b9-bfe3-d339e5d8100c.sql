CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Only add patient role if user has NO existing roles (doctor/admin created by admin already have roles)
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
      INSERT INTO public.patients (user_id) VALUES (NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;