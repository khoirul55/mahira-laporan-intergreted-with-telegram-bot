-- Debug Script: Check User Access & Division Assignment
-- Run ini di Supabase SQL Editor untuk investigasi

-- 1. Check user yang ada
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.division_id,
  d.name as division_name,
  u.is_active
FROM users u
LEFT JOIN divisions d ON u.division_id = d.id
WHERE u.role = 'staff'
ORDER BY u.full_name;

-- 2. Check division files access
SELECT 
  df.id,
  df.division_id,
  df.uploaded_by,
  df.filename,
  df.created_at,
  u.full_name as uploader_name,
  d.name as division_name
FROM division_files df
JOIN users u ON df.uploaded_by = u.id
LEFT JOIN divisions d ON df.division_id = d.id
ORDER BY df.created_at DESC;

-- 3. Test RLS policy untuk staff
-- Login sebagai staff lalu jalankan query ini:
SELECT get_user_role(), get_user_division();

-- 4. Check storage bucket
SELECT * FROM pg_bucket WHERE name = 'division-archives';

-- 5. Test file upload function
-- Cek apakah function get_user_division() bekerja:
SELECT proname, prosrc FROM pg_proc WHERE proname = 'get_user_division';
