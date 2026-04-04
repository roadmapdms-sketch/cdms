-- =============================================================================
-- NON-AUTHORITATIVE: Legacy / Supabase / manual SQL. Canonical: server/prisma/schema.prisma
-- (docs/ARCHITECTURE.md). Use Prisma migrations for the Express app.
-- =============================================================================
-- =====================================================
-- 🔍 QUICK DATABASE SETUP - Create Users Table Properly
-- =====================================================
-- Run this in Supabase SQL Editor to fix registration issues

-- First, let's create the users table with the correct structure
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'ACCOUNTANT', 'PASTOR', 'VOLUNTEER_COORDINATOR', 'MEMBER', 'VOLUNTEER', 'STAFF', 'USER')),
  isActive BOOLEAN DEFAULT true,
  profileImage TEXT,
  phone TEXT,
  dateOfBirth DATE,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  country TEXT DEFAULT 'Nigeria',
  joinDate DATE DEFAULT CURRENT_DATE,
  baptismDate DATE,
  membershipStatus TEXT DEFAULT 'ACTIVE' CHECK (membershipStatus IN ('ACTIVE', 'INACTIVE', 'VISITOR', 'TRANSFERRED')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users for testing
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'admin@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Admin', 'User', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@church.com');

INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'accountant@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Account', 'User', 'ACCOUNTANT', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'accountant@church.com');

INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'pastor@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Pastor', 'John', 'PASTOR', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pastor@church.com');

INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'volunteer@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Volunteer', 'Coordinator', 'VOLUNTEER_COORDINATOR', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'volunteer@church.com');

INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'member@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Church', 'Member', 'MEMBER', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'member@church.com');

-- Verification query
SELECT 'Users table recreated with proper structure!' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admin_users,
       (SELECT COUNT(*) FROM users WHERE role = 'ACCOUNTANT') as accountant_users,
       (SELECT COUNT(*) FROM users WHERE role = 'PASTOR') as pastor_users,
       (SELECT COUNT(*) FROM users WHERE role = 'VOLUNTEER_COORDINATOR') as coordinator_users,
       (SELECT COUNT(*) FROM users WHERE role = 'MEMBER') as member_users;
