# 🏛️ Church Management System - Complete Database Schema

> **Note:** Design reference only. The **authoritative** relational schema is [`server/prisma/schema.prisma`](server/prisma/schema.prisma); apply changes with Prisma migrations (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).

## 📊 Database Schema Design

### 🎯 Core Tables Structure

---

## 👥 **USER MANAGEMENT**

### 1. users
```sql
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
```

---

## 👥 **MEMBERS MANAGEMENT**

### 2. member_profiles
```sql
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
```

### 3. family_members
```sql
CREATE TABLE family_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  familyId TEXT,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT CHECK (relationship IN ('SELF', 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER')),
  isHeadOfFamily BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ **ATTENDANCE MANAGEMENT**

### 4. attendance_records
```sql
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
```

### 5. attendance_statistics
```sql
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
```

---

## 💰 **FINANCIAL MANAGEMENT**

### 6. giving_categories
```sql
CREATE TABLE giving_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. giving_records
```sql
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
```

### 8. financial_accounts
```sql
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
```

---

## 📅 **EVENTS MANAGEMENT**

### 9. events
```sql
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
```

### 10. event_registrations
```sql
CREATE TABLE event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  eventId TEXT REFERENCES events(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ATTENDED', 'CANCELLED')),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📧 **COMMUNICATIONS**

### 11. communication_groups
```sql
CREATE TABLE communication_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  groupType TEXT CHECK (groupType IN ('MINISTRY', 'DEPARTMENT', 'AGE_GROUP', 'SPECIAL', 'ALL_MEMBERS')),
  isActive BOOLEAN DEFAULT true,
  createdBy TEXT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12. group_members
```sql
CREATE TABLE group_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  groupId TEXT REFERENCES communication_groups(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MODERATOR', 'MEMBER')),
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 13. communications
```sql
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
```

### 14. communication_logs
```sql
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
```

---

## 🤝 **VOLUNTEERS MANAGEMENT**

### 15. volunteer_opportunities
```sql
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
```

### 16. volunteer_assignments
```sql
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
```

---

## 🙏 **PASTORAL CARE**

### 17. pastoral_care_records
```sql
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
```

### 18. prayer_requests
```sql
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
```

---

## 📦 **INVENTORY MANAGEMENT**

### 19. inventory_categories
```sql
CREATE TABLE inventory_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parentCategoryId TEXT REFERENCES inventory_categories(id),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 20. inventory_items
```sql
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
```

### 21. inventory_transactions
```sql
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
```

---

## 🧾 **EXPENSES MANAGEMENT**

### 22. expense_categories
```sql
CREATE TABLE expense_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  budgetLimit DECIMAL(12,2),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 23. expenses
```sql
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
```

---

## 🏢 **VENDORS MANAGEMENT**

### 24. vendors
```sql
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
```

---

## 📈 **BUDGET MANAGEMENT**

### 25. budgets
```sql
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
```

### 26. budget_items
```sql
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
```

---

## 📋 **REPORTS & ANALYTICS**

### 27. report_templates
```sql
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
```

### 28. generated_reports
```sql
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
```

---

## 🔗 **RELATIONSHIPS & INDEXES**

### Foreign Key Relationships:
- users → member_profiles (1:1)
- users → attendance_records (1:many)
- users → giving_records (1:many)
- users → event_registrations (1:many)
- users → volunteer_assignments (1:many)
- users → pastoral_care_records (1:many)

### Important Indexes:
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_attendance_records_user_date ON attendance_records(userId, createdAt);
CREATE INDEX idx_giving_records_date ON giving_records(createdAt);
CREATE INDEX idx_events_start_date ON events(startDate);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_volunteer_assignments_user ON volunteer_assignments(userId);
```

---

## 🎯 **INITIAL DATA SETUP**

### Default Giving Categories:
```sql
INSERT INTO giving_categories (name, description) VALUES
('Tithes', 'Regular tithing contributions'),
('Offerings', 'General church offerings'),
('Missions', 'Missionary support'),
('Building Fund', 'Church building projects'),
('Special Projects', 'Special church initiatives'),
('Benevolence', 'Helping those in need');
```

### Default Ministries:
```sql
INSERT INTO communication_groups (name, description, groupType) VALUES
('Worship Team', 'Music and worship ministry', 'MINISTRY'),
('Youth Ministry', 'Programs for young people', 'MINISTRY'),
('Children Ministry', 'Sunday school and children programs', 'MINISTRY'),
('Ushers', 'Church ushering team', 'MINISTRY'),
('Media Team', 'Audio/visual and media', 'MINISTRY'),
('Security Team', 'Church security and safety', 'MINISTRY');
```

---

## 🚀 **TOTAL: 28 TABLES**

This comprehensive schema covers all major church management functions:
- ✅ User Management & Authentication
- ✅ Member Profiles & Family Management
- ✅ Attendance Tracking & Statistics
- ✅ Financial Management & Giving
- ✅ Events Management & Registration
- ✅ Communications & Groups
- ✅ Volunteers Management
- ✅ Pastoral Care & Prayer Requests
- ✅ Inventory Management
- ✅ Expenses & Vendors
- ✅ Budget Management
- ✅ Reports & Analytics

Each table is designed with proper relationships, constraints, and indexes for optimal performance and data integrity.
