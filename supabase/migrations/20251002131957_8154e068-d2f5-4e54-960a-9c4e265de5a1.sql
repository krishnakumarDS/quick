-- Fix the generate_order_number function to cast bigint to text
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.order_number = 'ORD' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || LPAD((EXTRACT(epoch FROM NEW.created_at)::bigint % 100000)::text, 5, '0');
  RETURN NEW;
END;
$function$;