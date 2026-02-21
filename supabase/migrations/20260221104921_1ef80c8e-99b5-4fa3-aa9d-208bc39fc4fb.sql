
-- Add foreign key from doctors to profiles via user_id
ALTER TABLE public.doctors ADD CONSTRAINT doctors_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Add foreign key from patients to profiles via user_id  
ALTER TABLE public.patients ADD CONSTRAINT patients_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
