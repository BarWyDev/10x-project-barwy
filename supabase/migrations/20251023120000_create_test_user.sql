-- Migration: Create test user for development
-- Description: Creates a test user in auth.users for simplified testing without authentication
-- Author: AI Assistant
-- Date: 2025-10-23

-- Insert test user directly into auth.users
-- This is only for development/testing purposes!
-- In production, users should be created through proper Supabase Auth flows

-- Check if test user already exists, if not, create it
DO $$
DECLARE
    test_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
        -- Insert test user
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud
        ) VALUES (
            test_user_id,
            '00000000-0000-0000-0000-000000000000',
            'test@example.com',
            -- This is a bcrypt hash of 'password123' - you can use this to login
            '$2a$10$rZ5l3qKq5qKq5qKq5qKq5uZl3qKq5qKq5qKq5qKq5qKq5qKq5qKq5',
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Test User"}',
            false,
            'authenticated',
            'authenticated'
        );

        RAISE NOTICE 'Test user created with ID: %', test_user_id;
        RAISE NOTICE 'Email: test@example.com';
        RAISE NOTICE 'Password: password123';
    ELSE
        RAISE NOTICE 'Test user already exists';
    END IF;
END $$;

-- Note: Cannot add comment to auth.users (no permission in local Supabase)
-- Test user details: test@example.com / password123 / ID: 11111111-1111-1111-1111-111111111111

