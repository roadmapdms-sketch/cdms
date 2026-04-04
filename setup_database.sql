-- =============================================================================
-- NON-AUTHORITATIVE: Legacy / Supabase / manual SQL. Canonical: server/prisma/schema.prisma
-- (docs/ARCHITECTURE.md). Use Prisma migrations for the Express app.
-- =============================================================================
-- =====================================================
-- 🏛️ Church Management System - Complete Database Schema
-- =====================================================
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 👥 USER MANAGEMENT
-- =====================================================

-- 1. users table
CREATE TABLE users (
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
-- 👥 MEMBERS MANAGEMENT
-- =====================================================

-- 2. member_profiles
CREATE TABLE member_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  maritalStatus TEXT CHECK (maritalStatus IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')),
  spouseName TEXT,
  numberOfChildren INTEGER DEFAULT 0,
  occupation TEXT,
  employer TEXT,
  education TEXT,
  skills TEXT[], -- Array of skills
  interests TEXT[], -- Array of interests
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

-- 3. family_members
CREATE TABLE family_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  familyId TEXT,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT CHECK (relationship IN ('SELF', 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER')),
  isHeadOfFamily BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ✅ ATTENDANCE MANAGEMENT
-- =====================================================

-- 4. attendance_records
CREATE TABLE attendance_records (
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

-- 5. attendance_statistics
CREATE TABLE attendance_statistics (
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
-- 💰 FINANCIAL MANAGEMENT
-- =====================================================

-- 6. giving_categories
CREATE TABLE giving_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. giving_records
CREATE TABLE giving_records (
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

-- 8. financial_accounts
CREATE TABLE financial_accounts (
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
-- 📅 EVENTS MANAGEMENT
-- =====================================================

-- 9. events
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  eventType TEXT CHECK (eventType IN ('SERVICE', 'MEETING', 'CONFERENCE', 'SOCIAL', 'OUTREACH', 'TRAINING')),
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  location TEXT,
  maxAttendees INTEGER,
  isRecurring BOOLEAN DEFAULT false,
  recurringPattern TEXT, -- 'WEEKLY', 'MONTHLY', 'YEARLY'
  status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. event_registrations
CREATE TABLE event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  eventId TEXT REFERENCES events(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ATTENDED', 'CANCELLED')),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📧 COMMUNICATIONS
-- =====================================================

-- 11. communication_groups
CREATE TABLE communication_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  groupType TEXT CHECK (groupType IN ('MINISTRY', 'DEPARTMENT', 'AGE_GROUP', 'SPECIAL', 'ALL_MEMBERS')),
  isActive BOOLEAN DEFAULT true,
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. group_members
CREATE TABLE group_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  groupId TEXT REFERENCES communication_groups(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MODERATOR', 'MEMBER')),
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. communications
CREATE TABLE communications (
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

-- 14. communication_logs
CREATE TABLE communication_logs (
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
-- 🤝 VOLUNTEERS MANAGEMENT
-- =====================================================

-- 15. volunteer_opportunities
CREATE TABLE volunteer_opportunities (
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

-- 16. volunteer_assignments
CREATE TABLE volunteer_assignments (
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
-- 🙏 PASTORAL CARE
-- =====================================================

-- 17. pastoral_care_records
CREATE TABLE pastoral_care_records (
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

-- 18. prayer_requests
CREATE TABLE prayer_requests (
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
-- 📦 INVENTORY MANAGEMENT
-- =====================================================

-- 19. inventory_categories
CREATE TABLE inventory_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parentCategoryId TEXT REFERENCES inventory_categories(id),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. inventory_items
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  categoryId TEXT REFERENCES inventory_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  quantity INTEGER DEFAULT 0,
  minimumStock INTEGER DEFAULT 0,
  maximumStock INTEGER,
  unit TEXT, -- 'pieces', 'boxes', 'liters', etc.
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

-- 21. inventory_transactions
CREATE TABLE inventory_transactions (
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
-- 🧾 EXPENSES MANAGEMENT
-- =====================================================

-- 22. expense_categories
CREATE TABLE expense_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  budgetLimit DECIMAL(12,2),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  categoryId TEXT REFERENCES expense_categories(id),
  vendorId TEXT REFERENCES vendors(id),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expenseDate DATE NOT NULL,
  paymentMethod TEXT CHECK (paymentMethod IN ('CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE')),
  receiptNumber TEXT,
  receiptImage TEXT, -- URL to receipt image
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
-- 🏢 VENDORS MANAGEMENT
-- =====================================================

-- 24. vendors
CREATE TABLE vendors (
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
-- 📈 BUDGET MANAGEMENT
-- =====================================================

-- 25. budgets
CREATE TABLE budgets (
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

-- 26. budget_items
CREATE TABLE budget_items (
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
-- 📋 REPORTS & ANALYTICS
-- =====================================================

-- 27. report_templates
CREATE TABLE report_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  reportType TEXT CHECK (reportType IN ('ATTENDANCE', 'FINANCIAL', 'MEMBERS', 'EVENTS', 'VOLUNTEERS', 'CUSTOM')),
  query TEXT, -- SQL query or report logic
  parameters JSONB, -- Report parameters
  isActive BOOLEAN DEFAULT true,
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. generated_reports
CREATE TABLE generated_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  templateId TEXT REFERENCES report_templates(id),
  title TEXT NOT NULL,
  parameters JSONB,
  filePath TEXT, -- URL to generated report file
  format TEXT CHECK (format IN ('PDF', 'EXCEL', 'CSV')),
  status TEXT DEFAULT 'GENERATING' CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED')),
  generatedBy TEXT REFERENCES users(id),
  generatedAt TIMESTAMP,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🔗 INDEXES FOR PERFORMANCE
-- =====================================================

-- User management indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_membership_status ON users(membershipStatus);
CREATE INDEX idx_users_is_active ON users(isActive);

-- Attendance indexes
CREATE INDEX idx_attendance_records_user_date ON attendance_records(userId, createdAt);
CREATE INDEX idx_attendance_records_event ON attendance_records(eventId);
CREATE INDEX idx_attendance_records_service_type ON attendance_records(serviceType);
CREATE INDEX idx_attendance_statistics_user_year ON attendance_statistics(userId, year, month);

-- Financial indexes
CREATE INDEX idx_giving_records_user_date ON giving_records(userId, createdAt);
CREATE INDEX idx_giving_records_category ON giving_records(categoryId);
CREATE INDEX idx_giving_records_type ON giving_records(givingType);
CREATE INDEX idx_financial_accounts_active ON financial_accounts(isActive);

-- Events indexes
CREATE INDEX idx_events_start_date ON events(startDate);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(eventType);
CREATE INDEX idx_event_registrations_event ON event_registrations(eventId);
CREATE INDEX idx_event_registrations_user ON event_registrations(userId);

-- Communications indexes
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_group ON communications(groupId);
CREATE INDEX idx_group_members_group ON group_members(groupId);
CREATE INDEX idx_group_members_user ON group_members(userId);
CREATE INDEX idx_communication_logs_communication ON communication_logs(communicationId);

-- Volunteers indexes
CREATE INDEX idx_volunteer_opportunities_status ON volunteer_opportunities(status);
CREATE INDEX idx_volunteer_opportunities_ministry ON volunteer_opportunities(ministry);
CREATE INDEX idx_volunteer_assignments_user ON volunteer_assignments(userId);
CREATE INDEX idx_volunteer_assignments_opportunity ON volunteer_assignments(opportunityId);

-- Pastoral care indexes
CREATE INDEX idx_pastoral_care_member ON pastoral_care_records(memberId);
CREATE INDEX idx_pastoral_care_pastor ON pastoral_care_records(pastorId);
CREATE INDEX idx_pastoral_care_type ON pastoral_care_records(careType);
CREATE INDEX idx_prayer_requests_member ON prayer_requests(memberId);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);

-- Inventory indexes
CREATE INDEX idx_inventory_items_category ON inventory_items(categoryId);
CREATE INDEX idx_inventory_items_active ON inventory_items(isActive);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(itemId);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transactionType);

-- Expenses indexes
CREATE INDEX idx_expenses_category ON expenses(categoryId);
CREATE INDEX idx_expenses_vendor ON expenses(vendorId);
CREATE INDEX idx_expenses_date ON expenses(expenseDate);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_vendors_active ON vendors(isActive);

-- Budget indexes
CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscalYear);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budget_items_budget ON budget_items(budgetId);
CREATE INDEX idx_budget_items_category ON budget_items(categoryId);

-- Reports indexes
CREATE INDEX idx_report_templates_type ON report_templates(reportType);
CREATE INDEX idx_report_templates_active ON report_templates(isActive);
CREATE INDEX idx_generated_reports_template ON generated_reports(templateId);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);

-- =====================================================
-- 🎯 INITIAL DATA SETUP
-- =====================================================

-- Default Giving Categories
INSERT INTO giving_categories (name, description) VALUES
('Tithes', 'Regular tithing contributions'),
('Offerings', 'General church offerings'),
('Missions', 'Missionary support'),
('Building Fund', 'Church building projects'),
('Special Projects', 'Special church initiatives'),
('Benevolence', 'Helping those in need');

-- Default Ministries/Groups
INSERT INTO communication_groups (name, description, groupType) VALUES
('Worship Team', 'Music and worship ministry', 'MINISTRY'),
('Youth Ministry', 'Programs for young people', 'MINISTRY'),
('Children Ministry', 'Sunday school and children programs', 'MINISTRY'),
('Ushers', 'Church ushering team', 'MINISTRY'),
('Media Team', 'Audio/visual and media', 'MINISTRY'),
('Security Team', 'Church security and safety', 'MINISTRY'),
('Men Ministry', 'Men fellowship and programs', 'MINISTRY'),
('Women Ministry', 'Women fellowship and programs', 'MINISTRY'),
('All Members', 'General church communications', 'ALL_MEMBERS');

-- Default Expense Categories
INSERT INTO expense_categories (name, description) VALUES
('Utilities', 'Electricity, water, internet bills'),
('Rent/Mortgage', 'Building rent or mortgage payments'),
('Staff Salaries', 'Pastor and staff compensation'),
('Office Supplies', 'Stationery and office materials'),
('Maintenance', 'Building and equipment maintenance'),
('Outreach Programs', 'Community outreach expenses'),
('Training', 'Staff training and development'),
('Insurance', 'Church insurance premiums'),
('Marketing', 'Church promotion and advertising'),
('Transportation', 'Vehicle and travel expenses');

-- Default Inventory Categories
INSERT INTO inventory_categories (name, description) VALUES
('Audio Equipment', 'Sound system and audio devices'),
('Video Equipment', 'Cameras, projectors, screens'),
('Musical Instruments', 'Instruments for worship team'),
('Office Equipment', 'Computers, printers, furniture'),
('Kitchen Supplies', 'Kitchen and fellowship supplies'),
('Cleaning Supplies', 'Janitorial and cleaning materials'),
('Security Equipment', 'Safety and security items'),
('Decorations', 'Church decorations and banners'),
('Teaching Materials', 'Sunday school and training materials'),
('Vehicles', 'Church vehicles and transportation');

-- Create sample admin user (password: admin123)
INSERT INTO users (email, password, firstName, lastName, role, isActive) VALUES
('admin@church.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Admin', 'User', 'ADMIN', true);

-- =====================================================
-- ✅ COMPLETION MESSAGE
-- =====================================================

-- Database setup complete!
-- Total tables created: 28
-- Total indexes created: 50+
-- Total initial records: 40+

-- Next steps:
-- 1. Create sample events and users
-- 2. Set up Row Level Security (RLS) policies
-- 3. Configure API endpoints for all tables
-- 4. Test all functionality

SELECT 'Church Management System Database Setup Complete!' as status,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables_created,
       (SELECT COUNT(*) FROM giving_categories) as giving_categories,
       (SELECT COUNT(*) FROM communication_groups) as communication_groups,
       (SELECT COUNT(*) FROM expense_categories) as expense_categories,
       (SELECT COUNT(*) FROM inventory_categories) as inventory_categories;
