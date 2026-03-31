-- =====================================================
-- 🏛️ Church Management System - Database Setup (Correct Order)
-- =====================================================
-- This version creates tables in the correct dependency order
-- =====================================================

-- =====================================================
-- 🎯 CREATE TABLES IN CORRECT DEPENDENCY ORDER
-- =====================================================

-- Create tables without foreign key dependencies first
-- Then add tables with foreign keys

-- =====================================================
-- 👥 USER MANAGEMENT (No Dependencies)
-- =====================================================

-- 1. users table (only if not exists)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'PASTOR', 'STAFF', 'VOLUNTEER', 'USER')),
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

-- =====================================================
-- 💰 FINANCIAL MANAGEMENT (No Dependencies)
-- =====================================================

-- 2. giving_categories
CREATE TABLE IF NOT EXISTS giving_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. financial_accounts
CREATE TABLE IF NOT EXISTS financial_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  accountName TEXT NOT NULL,
  accountNumber TEXT,
  bankName TEXT,
  accountType TEXT CHECK (accountType IN ('CHECKING', 'SAVINGS', 'INVESTMENT')),
  balance DECIMAL(15,2) DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📅 EVENTS MANAGEMENT (No Dependencies)
-- =====================================================

-- 4. events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  eventType TEXT CHECK (eventType IN ('SERVICE', 'MEETING', 'CONFERENCE', 'SOCIAL', 'OUTREACH', 'TRAINING')),
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  location TEXT,
  maxAttendees INTEGER,
  isRecurring BOOLEAN DEFAULT false,
  recurringPattern TEXT,
  status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📧 COMMUNICATIONS (No Dependencies)
-- =====================================================

-- 5. communication_groups
CREATE TABLE IF NOT EXISTS communication_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  groupType TEXT CHECK (groupType IN ('MINISTRY', 'DEPARTMENT', 'AGE_GROUP', 'SPECIAL', 'ALL_MEMBERS')),
  isActive BOOLEAN DEFAULT true,
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🧾 EXPENSES MANAGEMENT (No Dependencies)
-- =====================================================

-- 6. expense_categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  budgetLimit DECIMAL(12,2),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. vendors
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contactPerson TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  country TEXT DEFAULT 'Nigeria',
  website TEXT,
  taxId TEXT,
  paymentTerms TEXT,
  notes TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📦 INVENTORY MANAGEMENT (No Dependencies)
-- =====================================================

-- 8. inventory_categories
CREATE TABLE IF NOT EXISTS inventory_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parentCategoryId TEXT REFERENCES inventory_categories(id),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📈 BUDGET MANAGEMENT (No Dependencies)
-- =====================================================

-- 9. budgets
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  fiscalYear INTEGER NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED')),
  totalBudget DECIMAL(15,2) NOT NULL,
  createdBy TEXT REFERENCES users(id),
  approvedBy TEXT REFERENCES users(id),
  approvedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. budget_items
CREATE TABLE IF NOT EXISTS budget_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  budgetId TEXT REFERENCES budgets(id) ON DELETE CASCADE,
  categoryId TEXT REFERENCES expense_categories(id),
  categoryName TEXT NOT NULL,
  allocatedAmount DECIMAL(12,2) NOT NULL,
  spentAmount DECIMAL(12,2) DEFAULT 0,
  remainingAmount DECIMAL(12,2) GENERATED ALWAYS AS (allocatedAmount - spentAmount) STORED,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 👥 MEMBERS MANAGEMENT (Dependencies on users)
-- =====================================================

-- 11. member_profiles
CREATE TABLE IF NOT EXISTS member_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  maritalStatus TEXT CHECK (maritalStatus IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')),
  spouseName TEXT,
  numberOfChildren INTEGER DEFAULT 0,
  occupation TEXT,
  employer TEXT,
  education TEXT,
  skills TEXT[],
  interests TEXT[],
  ministry TEXT CHECK (ministry IN ('WORSHIP', 'YOUTH', 'CHILDREN', 'OUTREACH', 'MEN', 'WOMEN', 'MEDIA', 'SECURITY', 'USHERS')),
  department TEXT,
  emergencyContactName TEXT,
  emergencyContactPhone TEXT,
  emergencyContactRelationship TEXT,
  medicalInfo TEXT,
  allergies TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. family_members
CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  familyId TEXT,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT CHECK (relationship IN ('SELF', 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER')),
  isHeadOfFamily BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ✅ ATTENDANCE MANAGEMENT (Dependencies on users, events)
-- =====================================================

-- 13. attendance_records
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  eventId TEXT REFERENCES events(id) ON DELETE CASCADE,
  serviceType TEXT CHECK (serviceType IN ('SUNDAY_MORNING', 'SUNDAY_EVENING', 'MIDWEEK', 'SPECIAL', 'ONLINE')),
  checkInTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checkOutTime TIMESTAMP,
  attended BOOLEAN DEFAULT true,
  notes TEXT,
  recordedBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. attendance_statistics
CREATE TABLE IF NOT EXISTS attendance_statistics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER,
  month INTEGER,
  week INTEGER,
  totalServices INTEGER DEFAULT 0,
  attendedServices INTEGER DEFAULT 0,
  attendanceRate DECIMAL(5,2),
  lastAttendanceDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 💰 FINANCIAL RECORDS (Dependencies on users, categories)
-- =====================================================

-- 15. giving_records
CREATE TABLE IF NOT EXISTS giving_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT REFERENCES users(id) ON DELETE SET NULL,
  categoryId TEXT REFERENCES giving_categories(id),
  amount DECIMAL(12,2) NOT NULL,
  paymentMethod TEXT CHECK (paymentMethod IN ('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'CHEQUE')),
  transactionId TEXT UNIQUE,
  givingType TEXT CHECK (givingType IN ('TITHE', 'OFFERING', 'SPECIAL', 'PROJECT', 'MISSIONS', 'BUILDING')),
  isAnonymous BOOLEAN DEFAULT false,
  notes TEXT,
  receiptNumber TEXT,
  recordedBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📅 EVENTS REGISTRATIONS (Dependencies on users, events)
-- =====================================================

-- 16. event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  eventId TEXT REFERENCES events(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ATTENDED', 'CANCELLED')),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📧 COMMUNICATIONS RECORDS (Dependencies on users, groups)
-- =====================================================

-- 17. group_members
CREATE TABLE IF NOT EXISTS group_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  groupId TEXT REFERENCES communication_groups(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MODERATOR', 'MEMBER')),
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. communications
CREATE TABLE IF NOT EXISTS communications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('EMAIL', 'SMS', 'PUSH', 'ANNOUNCEMENT')),
  groupId TEXT REFERENCES communication_groups(id),
  senderId TEXT REFERENCES users(id),
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENT', 'FAILED')),
  scheduledFor TIMESTAMP,
  sentAt TIMESTAMP,
  recipientCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. communication_logs
CREATE TABLE IF NOT EXISTS communication_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  communicationId TEXT REFERENCES communications(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('SENT', 'DELIVERED', 'FAILED', 'OPENED')),
  sentAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  openedAt TIMESTAMP,
  error TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🤝 VOLUNTEERS MANAGEMENT (Dependencies on users, groups)
-- =====================================================

-- 20. volunteer_opportunities
CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  ministry TEXT REFERENCES communication_groups(id),
  skillsRequired TEXT[],
  timeCommitment TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'FILLED')),
  urgency TEXT CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  contactPerson TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. volunteer_assignments
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunityId TEXT REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  assignedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN')),
  notes TEXT,
  assignedBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🙏 PASTORAL CARE (Dependencies on users)
-- =====================================================

-- 22. pastoral_care_records
CREATE TABLE IF NOT EXISTS pastoral_care_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  memberId TEXT REFERENCES users(id) ON DELETE CASCADE,
  pastorId TEXT REFERENCES users(id) ON DELETE CASCADE,
  careType TEXT CHECK (careType IN ('VISIT', 'CALL', 'COUNSELING', 'PRAYER', 'SUPPORT', 'FOLLOW_UP')),
  reason TEXT,
  details TEXT,
  outcome TEXT,
  followUpRequired BOOLEAN DEFAULT false,
  followUpDate DATE,
  isConfidential BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. prayer_requests
CREATE TABLE IF NOT EXISTS prayer_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  memberId TEXT REFERENCES users(id) ON DELETE CASCADE,
  request TEXT NOT NULL,
  isAnonymous BOOLEAN DEFAULT false,
  isPublic BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('HEALTH', 'FAMILY', 'FINANCIAL', 'SPIRITUAL', 'CAREER', 'OTHER')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ANSWERED', 'CLOSED')),
  answeredDate DATE,
  prayerCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📦 INVENTORY ITEMS (Dependencies on categories)
-- =====================================================

-- 24. inventory_items
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  categoryId TEXT REFERENCES inventory_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  quantity INTEGER DEFAULT 0,
  minimumStock INTEGER DEFAULT 0,
  maximumStock INTEGER,
  unit TEXT,
  location TEXT,
  condition TEXT CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'POOR')),
  purchasePrice DECIMAL(10,2),
  currentValue DECIMAL(10,2),
  purchaseDate DATE,
  lastInventoryDate DATE,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. inventory_transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  itemId TEXT REFERENCES inventory_items(id) ON DELETE CASCADE,
  transactionType TEXT CHECK (transactionType IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  referenceNumber TEXT,
  performedBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🧾 EXPENSES RECORDS (Dependencies on users, categories, vendors)
-- =====================================================

-- 26. expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  categoryId TEXT REFERENCES expense_categories(id),
  vendorId TEXT REFERENCES vendors(id),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expenseDate DATE NOT NULL,
  paymentMethod TEXT CHECK (paymentMethod IN ('CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE')),
  receiptNumber TEXT,
  receiptImage TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  approvedBy TEXT REFERENCES users(id),
  approvedAt TIMESTAMP,
  paidBy TEXT REFERENCES users(id),
  paidAt TIMESTAMP,
  notes TEXT,
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📋 REPORTS & ANALYTICS (Dependencies on users)
-- =====================================================

-- 27. report_templates
CREATE TABLE IF NOT EXISTS report_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  reportType TEXT CHECK (reportType IN ('ATTENDANCE', 'FINANCIAL', 'MEMBERS', 'EVENTS', 'VOLUNTEERS', 'CUSTOM')),
  query TEXT,
  parameters JSONB,
  isActive BOOLEAN DEFAULT true,
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. generated_reports
CREATE TABLE IF NOT EXISTS generated_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  templateId TEXT REFERENCES report_templates(id),
  title TEXT NOT NULL,
  parameters JSONB,
  filePath TEXT,
  format TEXT CHECK (format IN ('PDF', 'EXCEL', 'CSV')),
  status TEXT DEFAULT 'GENERATING' CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED')),
  generatedBy TEXT REFERENCES users(id),
  generatedAt TIMESTAMP,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🔗 INDEXES (Safe Creation)
-- =====================================================

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON users(membershipStatus);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(isActive);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(startDate);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(eventType);

CREATE INDEX IF NOT EXISTS idx_attendance_records_user_date ON attendance_records(userId, createdAt);
CREATE INDEX IF NOT EXISTS idx_attendance_records_event ON attendance_records(eventId);
CREATE INDEX IF NOT EXISTS idx_attendance_records_service_type ON attendance_records(serviceType);

CREATE INDEX IF NOT EXISTS idx_giving_records_user_date ON giving_records(userId, createdAt);
CREATE INDEX IF NOT EXISTS idx_giving_records_category ON giving_records(categoryId);
CREATE INDEX IF NOT EXISTS idx_giving_records_type ON giving_records(givingType);

CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_group ON communications(groupId);

CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_status ON volunteer_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_user ON volunteer_assignments(userId);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(categoryId);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- =====================================================
-- 🎯 INITIAL DATA (Safe Insertion)
-- =====================================================

-- Insert only if data doesn't exist
INSERT INTO giving_categories (name, description) 
SELECT 'Tithes', 'Regular tithing contributions'
WHERE NOT EXISTS (SELECT 1 FROM giving_categories WHERE name = 'Tithes');

INSERT INTO giving_categories (name, description) 
SELECT 'Offerings', 'General church offerings'
WHERE NOT EXISTS (SELECT 1 FROM giving_categories WHERE name = 'Offerings');

INSERT INTO giving_categories (name, description) 
SELECT 'Missions', 'Missionary support'
WHERE NOT EXISTS (SELECT 1 FROM giving_categories WHERE name = 'Missions');

INSERT INTO giving_categories (name, description) 
SELECT 'Building Fund', 'Church building projects'
WHERE NOT EXISTS (SELECT 1 FROM giving_categories WHERE name = 'Building Fund');

INSERT INTO giving_categories (name, description) 
SELECT 'Special Projects', 'Special church initiatives'
WHERE NOT EXISTS (SELECT 1 FROM giving_categories WHERE name = 'Special Projects');

INSERT INTO giving_categories (name, description) 
SELECT 'Benevolence', 'Helping those in need'
WHERE NOT EXISTS (SELECT 1 FROM giving_categories WHERE name = 'Benevolence');

-- Insert ministries only if they don't exist
INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Worship Team', 'Music and worship ministry', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Worship Team');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Youth Ministry', 'Programs for young people', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Youth Ministry');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Children Ministry', 'Sunday school and children programs', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Children Ministry');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Ushers', 'Church ushering team', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Ushers');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Media Team', 'Audio/visual and media', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Media Team');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Security Team', 'Church security and safety', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Security Team');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Men Ministry', 'Men fellowship and programs', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Men Ministry');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'Women Ministry', 'Women fellowship and programs', 'MINISTRY'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'Women Ministry');

INSERT INTO communication_groups (name, description, groupType) 
SELECT 'All Members', 'General church communications', 'ALL_MEMBERS'
WHERE NOT EXISTS (SELECT 1 FROM communication_groups WHERE name = 'All Members');

-- Insert expense categories only if they don't exist
INSERT INTO expense_categories (name, description) 
SELECT 'Utilities', 'Electricity, water, internet bills'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Utilities');

INSERT INTO expense_categories (name, description) 
SELECT 'Rent/Mortgage', 'Building rent or mortgage payments'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Rent/Mortgage');

INSERT INTO expense_categories (name, description) 
SELECT 'Staff Salaries', 'Pastor and staff compensation'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Staff Salaries');

INSERT INTO expense_categories (name, description) 
SELECT 'Office Supplies', 'Stationery and office materials'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Office Supplies');

INSERT INTO expense_categories (name, description) 
SELECT 'Maintenance', 'Building and equipment maintenance'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Maintenance');

INSERT INTO expense_categories (name, description) 
SELECT 'Outreach Programs', 'Community outreach expenses'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Outreach Programs');

INSERT INTO expense_categories (name, description) 
SELECT 'Training', 'Staff training and development'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Training');

INSERT INTO expense_categories (name, description) 
SELECT 'Insurance', 'Church insurance premiums'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Insurance');

INSERT INTO expense_categories (name, description) 
SELECT 'Marketing', 'Church promotion and advertising'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Marketing');

INSERT INTO expense_categories (name, description) 
SELECT 'Transportation', 'Vehicle and travel expenses'
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Transportation');

-- Insert inventory categories only if they don't exist
INSERT INTO inventory_categories (name, description) 
SELECT 'Audio Equipment', 'Sound system and audio devices'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Audio Equipment');

INSERT INTO inventory_categories (name, description) 
SELECT 'Video Equipment', 'Cameras, projectors, screens'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Video Equipment');

INSERT INTO inventory_categories (name, description) 
SELECT 'Musical Instruments', 'Instruments for worship team'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Musical Instruments');

INSERT INTO inventory_categories (name, description) 
SELECT 'Office Equipment', 'Computers, printers, furniture'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Office Equipment');

INSERT INTO inventory_categories (name, description) 
SELECT 'Kitchen Supplies', 'Kitchen and fellowship supplies'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Kitchen Supplies');

INSERT INTO inventory_categories (name, description) 
SELECT 'Cleaning Supplies', 'Janitorial and cleaning materials'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Cleaning Supplies');

INSERT INTO inventory_categories (name, description) 
SELECT 'Security Equipment', 'Safety and security items'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Security Equipment');

INSERT INTO inventory_categories (name, description) 
SELECT 'Decorations', 'Church decorations and banners'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Decorations');

INSERT INTO inventory_categories (name, description) 
SELECT 'Teaching Materials', 'Sunday school and training materials'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Teaching Materials');

INSERT INTO inventory_categories (name, description) 
SELECT 'Vehicles', 'Church vehicles and transportation'
WHERE NOT EXISTS (SELECT 1 FROM inventory_categories WHERE name = 'Vehicles');

-- Create sample admin user only if not exists
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
SELECT 'admin@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Admin', 'User', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@church.com');

-- =====================================================
-- ✅ VERIFICATION QUERY
-- =====================================================

-- Show final status
SELECT 'Church Management System Database Setup Complete!' as status,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
       (SELECT COUNT(*) FROM giving_categories) as giving_categories_count,
       (SELECT COUNT(*) FROM communication_groups) as communication_groups_count,
       (SELECT COUNT(*) FROM expense_categories) as expense_categories_count,
       (SELECT COUNT(*) FROM inventory_categories) as inventory_categories_count,
       (SELECT COUNT(*) FROM users WHERE email = 'admin@church.com') as admin_user_created;
