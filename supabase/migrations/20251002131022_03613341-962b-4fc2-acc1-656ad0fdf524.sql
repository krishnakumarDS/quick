-- Enable customers to create orders
CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Enable order items to be created
CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE customer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Enable restaurant owners to update their orders
CREATE POLICY "Restaurant owners can update their orders"
ON public.orders
FOR UPDATE
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants
    WHERE owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Enable real-time for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable real-time for order_items table
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;