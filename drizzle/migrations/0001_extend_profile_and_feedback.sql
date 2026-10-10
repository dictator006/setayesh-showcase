ALTER TABLE public.about ADD COLUMN short_bio text, ADD COLUMN social_links jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN skill_levels jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.categories ADD COLUMN featured boolean NOT NULL DEFAULT false, ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.contact_messages ADD COLUMN kind text NOT NULL DEFAULT 'contact', ADD COLUMN rating integer;
CREATE OR REPLACE FUNCTION public.validate_contact_message() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
IF char_length(trim(NEW.full_name)) NOT BETWEEN 3 AND 100 OR char_length(NEW.email) > 255 OR NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR char_length(trim(NEW.message)) NOT BETWEEN 10 AND 2000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
IF NEW.kind NOT IN ('contact','feedback') OR (NEW.rating IS NOT NULL AND NEW.rating NOT BETWEEN 1 AND 5) THEN RAISE EXCEPTION 'Invalid feedback'; END IF; RETURN NEW; END $$;
CREATE TRIGGER validate_contact_message BEFORE INSERT OR UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.validate_contact_message();