-- =============================================================================
-- NON-AUTHORITATIVE: Legacy / Supabase / manual SQL. Canonical: server/prisma/schema.prisma
-- (docs/ARCHITECTURE.md). Use Prisma migrations for the Express app.
-- =============================================================================
-- =====================================================
-- 🏛️ Update Users Table for Role-Based System
-- =====================================================
-- Run this in Supabase SQL Editor to update the users table

-- First, let's see what constraints exist and update them
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new role constraint with all required roles
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'ACCOUNTANT', 'PASTOR', 'VOLUNTEER_COORDINATOR', 'MEMBER', 'VOLUNTEER', 'STAFF', 'USER', 'MEDIA_DEPARTMENT', 'KITCHEN_RESTAURANT', 'MANAGEMENT'));

-- Create role permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  permissions TEXT[],
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default role permissions
INSERT INTO role_permissions (role, module, permissions, description) 
SELECT 'ADMIN', 'SYSTEM', ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE_USERS', 'MANAGE_SETTINGS'], 'Full system access'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'ADMIN' AND module = 'SYSTEM');

INSERT INTO role_permissions (role, module, permissions, description) 
SELECT 'ACCOUNTANT', 'FINANCIAL', ARRAY['CREATE', 'READ', 'UPDATE', 'APPROVE_EXPENSES', 'GENERATE_REPORTS'], 'Financial management access'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'ACCOUNTANT' AND module = 'FINANCIAL');

INSERT INTO role_permissions (role, module, permissions, description) 
SELECT 'PASTOR', 'PASTORAL', ARRAY['READ', 'UPDATE', 'MANAGE_MEMBERS', 'PASTORAL_CARE', 'COMMUNICATIONS'], 'Pastoral care access'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'PASTOR' AND module = 'PASTORAL');

INSERT INTO role_permissions (role, module, permissions, description) 
SELECT 'VOLUNTEER_COORDINATOR', 'VOLUNTEERS', ARRAY['CREATE', 'READ', 'UPDATE', 'MANAGE_VOLUNTEERS', 'MANAGE_EVENTS'], 'Volunteer management access'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'VOLUNTEER_COORDINATOR' AND module = 'VOLUNTEERS');

INSERT INTO role_permissions (role, module, permissions, description) 
SELECT 'MEMBER', 'PERSONAL', ARRAY['READ_PROFILE', 'UPDATE_PROFILE', 'VIEW_EVENTS', 'REGISTER_EVENTS', 'VIEW_GIVING'], 'Personal member access'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'MEMBER' AND module = 'PERSONAL');

INSERT INTO role_permissions (role, module, permissions, description) 
SELECT 'VOLUNTEER', 'PERSONAL', ARRAY['READ_PROFILE', 'UPDATE_PROFILE', 'VIEW_EVENTS', 'REGISTER_EVENTS', 'VIEW_SCHEDULE'], 'Volunteer personal access'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'VOLUNTEER' AND module = 'PERSONAL');

-- Create sample users for testing different roles
-- Note: In production, these would be created through the registration process

-- Admin user (already exists)
-- Accountant user
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'accountant@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Account', 'User', 'ACCOUNTANT', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'accountant@church.com');

-- Pastor user
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'pastor@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Pastor', 'John', 'PASTOR', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pastor@church.com');

-- Volunteer Coordinator user
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'volunteer@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Volunteer', 'Coordinator', 'VOLUNTEER_COORDINATOR', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'volunteer@church.com');

-- Regular Member user
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'member@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Church', 'Member', 'MEMBER', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'member@church.com');

-- Regular Volunteer user
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'volunteer2@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Volunteer', 'Member', 'VOLUNTEER', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'volunteer2@church.com');

-- Verification query
SELECT 'Role-based system setup complete!' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM role_permissions) as total_permissions,
       (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admin_users,
       (SELECT COUNT(*) FROM users WHERE role = 'ACCOUNTANT') as accountant_users,
       (SELECT COUNT(*) FROM users WHERE role = 'PASTOR') as pastor_users,
       (SELECT COUNT(*) FROM users WHERE role = 'VOLUNTEER_COORDINATOR') as coordinator_users,
       (SELECT COUNT(*) FROM users WHERE role = 'MEMBER') as member_users,
       (SELECT COUNT(*) FROM users WHERE role = 'VOLUNTEER') as volunteer_users;
