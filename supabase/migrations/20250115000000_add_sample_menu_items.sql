-- Add sample restaurants and menu items with proper images
-- This migration adds sample data to help with development and testing

-- First, let's add some sample restaurants
INSERT INTO public.restaurants (
  id,
  owner_id,
  name,
  description,
  category,
  image_url,
  address,
  latitude,
  longitude,
  phone,
  email,
  opening_time,
  closing_time,
  is_active,
  is_approved,
  rating,
  total_reviews,
  delivery_radius,
  commission_rate
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000', -- This will be updated when a real owner signs up
  'Spice Palace',
  'Authentic Indian cuisine with a modern twist',
  'Indian',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
  '123 Main Street, Coimbatore',
  11.0168,
  76.9558,
  '+91 9876543210',
  'spicepalace@example.com',
  '10:00',
  '23:00',
  true,
  true,
  4.5,
  250,
  5000,
  10.00
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'Middle Eastern Delights',
  'Fresh shawarma and Middle Eastern specialties',
  'Middle Eastern',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  '456 Park Avenue, Coimbatore',
  11.0168,
  76.9558,
  '+91 9876543211',
  'middleeastern@example.com',
  '11:00',
  '22:30',
  true,
  true,
  4.3,
  180,
  4000,
  12.00
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'Biryani House',
  'Premium biryani and rice dishes',
  'Indian',
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  '789 Central Road, Coimbatore',
  11.0168,
  76.9558,
  '+91 9876543212',
  'biryanihouse@example.com',
  '09:00',
  '23:30',
  true,
  true,
  4.7,
  320,
  6000,
  8.00
),
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'Chef Specials',
  'Daily specials and chef recommendations',
  'Continental',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  '321 Food Court, Coimbatore',
  11.0168,
  76.9558,
  '+91 9876543213',
  'chefspecials@example.com',
  '08:00',
  '24:00',
  true,
  true,
  4.4,
  190,
  7000,
  15.00
);

-- Now add sample menu items with proper images
INSERT INTO public.menu_items (
  id,
  restaurant_id,
  name,
  description,
  category,
  price,
  image_url,
  is_vegetarian,
  is_available,
  preparation_time
) VALUES 
-- Spice Palace items
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Chicken Biryani',
  'Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and saffron',
  'biryani',
  299.00,
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  false,
  true,
  25
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Mutton Biryani',
  'Rich and flavorful mutton biryani with premium basmati rice',
  'biryani',
  399.00,
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  false,
  true,
  30
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'Veg Biryani',
  'Delicious vegetarian biryani with mixed vegetables and aromatic spices',
  'biryani',
  199.00,
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  true,
  true,
  20
),

-- Middle Eastern Delights items
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '22222222-2222-2222-2222-222222222222',
  'Chicken Shawarma',
  'Tender chicken wrapped in soft pita bread with fresh vegetables and tahini sauce',
  'shawarma',
  149.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  false,
  true,
  15
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '22222222-2222-2222-2222-222222222222',
  'Lamb Shawarma',
  'Succulent lamb shawarma with garlic sauce and pickled vegetables',
  'shawarma',
  199.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  false,
  true,
  18
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '22222222-2222-2222-2222-222222222222',
  'Falafel Wrap',
  'Crispy falafel balls wrapped in pita with hummus and fresh salad',
  'shawarma',
  129.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  true,
  true,
  12
),

-- Biryani House items
(
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  '33333333-3333-3333-3333-333333333333',
  'Hyderabadi Biryani',
  'Authentic Hyderabadi style biryani with dum cooking technique',
  'biryani',
  349.00,
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  false,
  true,
  35
),
(
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  '33333333-3333-3333-3333-333333333333',
  'Lucknowi Biryani',
  'Royal Lucknowi biryani with aromatic spices and saffron',
  'biryani',
  379.00,
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  false,
  true,
  40
),
(
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  '33333333-3333-3333-3333-333333333333',
  'Kolkata Biryani',
  'Bengali style biryani with potatoes and boiled eggs',
  'biryani',
  279.00,
  'https://images.unsplash.com/photo-1599043513900-9466d0404437?w=400&h=300&fit=crop',
  false,
  true,
  25
),

-- Chef Specials items
(
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  '44444444-4444-4444-4444-444444444444',
  'Chef Special Biryani',
  'Our signature biryani with a unique blend of spices and premium ingredients',
  'special',
  449.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  false,
  true,
  45
),
(
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  '44444444-4444-4444-4444-444444444444',
  'Special Shawarma Combo',
  'Chef special shawarma with extra meat, special sauce, and sides',
  'special',
  249.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  false,
  true,
  20
),
(
  'llllllll-llll-llll-llll-llllllllllll',
  '44444444-4444-4444-4444-444444444444',
  'Today Special',
  'Chef daily special - changes every day based on fresh ingredients',
  'special',
  199.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  true,
  true,
  15
),
(
  'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
  '44444444-4444-4444-4444-444444444444',
  'Premium Special',
  'Our most premium dish with the finest ingredients and unique preparation',
  'special',
  599.00,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  false,
  true,
  50
);

-- Update the restaurant owner_id to a dummy profile (this will be updated when real users sign up)
-- First create a dummy profile for the sample restaurants
INSERT INTO public.profiles (
  id,
  user_id,
  role,
  full_name,
  email,
  is_verified,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'vendor',
  'Sample Restaurant Owner',
  'sample@example.com',
  true,
  true
) ON CONFLICT (id) DO NOTHING;
