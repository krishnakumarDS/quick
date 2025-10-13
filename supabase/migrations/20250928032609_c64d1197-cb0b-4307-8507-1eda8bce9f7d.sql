-- Create restaurant profile after signup trigger
CREATE OR REPLACE FUNCTION public.create_restaurant_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create restaurant record when a restaurant owner signs up
  IF NEW.raw_user_meta_data ->> 'role' = 'restaurant_owner' THEN
    INSERT INTO public.restaurants (
      owner_id,
      name,
      category,
      address,
      phone,
      email,
      latitude,
      longitude,
      is_active,
      is_approved
    ) VALUES (
      (SELECT id FROM profiles WHERE user_id = NEW.id),
      NEW.raw_user_meta_data ->> 'restaurant_name',
      NEW.raw_user_meta_data ->> 'category',
      NEW.raw_user_meta_data ->> 'address',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.email,
      0, -- default latitude
      0, -- default longitude
      false, -- default to inactive until approved
      false  -- requires admin approval
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for restaurant profile creation
CREATE TRIGGER on_restaurant_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data ->> 'role' = 'restaurant_owner')
  EXECUTE FUNCTION public.create_restaurant_profile();