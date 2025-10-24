-- Drop existing policy for viewing orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create new policy that allows:
-- 1. Customers to view their orders
-- 2. Delivery partners to view their assigned orders
-- 3. Delivery partners to view available 'ready_for_pickup' orders (not yet assigned)
-- 4. Restaurant owners to view their restaurant's orders
CREATE POLICY "Users can view their orders and delivery partners can view available orders"
ON orders
FOR SELECT
USING (
  -- Customer can view their own orders
  (customer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ))
  OR
  -- Delivery partner can view their assigned orders
  (delivery_partner_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ))
  OR
  -- Delivery partners can view all 'ready_for_pickup' orders that are not assigned yet
  (
    status = 'ready_for_pickup' 
    AND delivery_partner_id IS NULL
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'delivery_partner'
    )
  )
  OR
  -- Restaurant owners can view their restaurant's orders
  (restaurant_id IN (
    SELECT id FROM restaurants 
    WHERE owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ))
);