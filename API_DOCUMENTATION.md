# Church Data Management System - API Documentation

## Overview

The CDMS API provides RESTful endpoints for managing all aspects of church operations including members, events, attendance, financial records, volunteers, and more.

**Base URL**: `http://localhost:5000/api`

## Authentication

All API endpoints (except authentication endpoints) require JWT authentication in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF"
}
```

#### Logout
```http
POST /api/auth/logout
```

## Members API

### Get Members
```http
GET /api/members
```

**Query Parameters:**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `search` (string): Search term for name, email, or phone
- `status` (string): Filter by member status (ACTIVE, INACTIVE)
- `ministry` (string): Filter by ministry assignment

**Response:**
```json
{
  "members": [
    {
      "id": "member_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "ACTIVE",
      "ministry": "WORSHIP",
      "membershipDate": "2020-01-15",
      "createdAt": "2020-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Create Member
```http
POST /api/members
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "ministry": "WORSHIP",
  "status": "ACTIVE"
}
```

### Update Member
```http
PUT /api/members/:id
```

### Delete Member
```http
DELETE /api/members/:id
```

## Events API

### Get Events
```http
GET /api/events
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `type` (string): Event type filter
- `status` (string): Event status filter
- `dateFrom` (string): Start date filter (YYYY-MM-DD)
- `dateTo` (string): End date filter (YYYY-MM-DD)

**Response:**
```json
{
  "events": [
    {
      "id": "event_id",
      "title": "Sunday Service",
      "description": "Weekly worship service",
      "type": "WORSHIP",
      "startDate": "2024-01-21T10:00:00.000Z",
      "endDate": "2024-01-21T12:00:00.000Z",
      "location": "Main Sanctuary",
      "maxCapacity": 500,
      "status": "SCHEDULED",
      "createdBy": "user_id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Create Event
```http
POST /api/events
```

**Request Body:**
```json
{
  "title": "Sunday Service",
  "description": "Weekly worship service",
  "type": "WORSHIP",
  "startDate": "2024-01-21T10:00:00.000Z",
  "endDate": "2024-01-21T12:00:00.000Z",
  "location": "Main Sanctuary",
  "maxCapacity": 500
}
```

## Attendance API

### Get Attendance Records
```http
GET /api/attendance
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `eventId` (string): Filter by event
- `memberId` (string): Filter by member
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter

### Check In Member
```http
POST /api/attendance/checkin
```

**Request Body:**
```json
{
  "memberId": "member_id",
  "eventId": "event_id",
  "notes": "On time"
}
```

### Check Out Member
```http
POST /api/attendance/checkout
```

**Request Body:**
```json
{
  "attendanceId": "attendance_id",
  "notes": "Service completed"
}
```

## Financial API

### Get Financial Records
```http
GET /api/financial
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Transaction type (TITHE, OFFERING, DONATION)
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter

### Add Financial Record
```http
POST /api/financial
```

**Request Body:**
```json
{
  "memberId": "member_id",
  "type": "TITHE",
  "amount": 100.00,
  "paymentMethod": "CASH",
  "description": "Regular tithe",
  "date": "2024-01-21"
}
```

## Expenses API

### Get Expenses
```http
GET /api/expenses
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Expense category
- `status` (string): Expense status (PENDING, APPROVED, REJECTED, PAID)
- `vendor` (string): Vendor filter
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter

### Create Expense
```http
POST /api/expenses
```

**Request Body:**
```json
{
  "description": "Office supplies",
  "amount": 250.00,
  "category": "SUPPLIES",
  "vendor": "Office Depot",
  "date": "2024-01-21",
  "notes": "Monthly office supplies"
}
```

### Approve Expense
```http
POST /api/expenses/:id/approve
```

### Reject Expense
```http
POST /api/expenses/:id/reject
```

## Volunteers API

### Get Volunteer Assignments
```http
GET /api/volunteers
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `ministry` (string): Ministry filter
- `status` (string): Assignment status
- `memberId` (string): Member filter

### Create Volunteer Assignment
```http
POST /api/volunteers
```

**Request Body:**
```json
{
  "memberId": "member_id",
  "ministryId": "ministry_id",
  "role": "Usher",
  "status": "ASSIGNED",
  "startDate": "2024-01-21"
}
```

## Pastoral Care API

### Get Pastoral Care Records
```http
GET /api/pastoral-care
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Care type filter
- `status` (string): Status filter (OPEN, IN_PROGRESS, CLOSED)
- `memberId` (string): Member filter

### Create Pastoral Care Record
```http
POST /api/pastoral-care
```

**Request Body:**
```json
{
  "memberId": "member_id",
  "type": "COUNSELING",
  "description": "Marriage counseling session",
  "status": "OPEN",
  "followUpDate": "2024-01-28"
}
```

## Inventory API

### Get Inventory Items
```http
GET /api/inventory
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Category filter
- `status` (string): Status filter (AVAILABLE, CHECKED_OUT, MAINTENANCE)
- `condition` (string): Condition filter

### Create Inventory Item
```http
POST /api/inventory
```

**Request Body:**
```json
{
  "name": "Projector",
  "description": "HD projector for sanctuary",
  "category": "AUDIO_VISUAL",
  "quantity": 1,
  "condition": "GOOD",
  "location": "Sanctuary",
  "purchaseCost": 2500.00,
  "currentValue": 2000.00
}
```

### Checkout Item
```http
POST /api/inventory/:id/checkout
```

**Request Body:**
```json
{
  "userId": "user_id",
  "expectedReturnDate": "2024-01-28",
  "notes": "Used for Sunday service"
}
```

## Vendors API

### Get Vendors
```http
GET /api/vendors
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `category` (string): Category filter
- `status` (string): Active status filter

### Create Vendor
```http
POST /api/vendors
```

**Request Body:**
```json
{
  "name": "Office Depot",
  "contactPerson": "John Smith",
  "email": "john@officedepot.com",
  "phone": "+1234567890",
  "address": "123 Supply St",
  "services": "Office supplies, furniture, electronics",
  "isActive": true
}
```

## Budget API

### Get Budgets
```http
GET /api/budget
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Category filter
- `status` (string): Status filter
- `period` (string): Period filter
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter

### Create Budget
```http
POST /api/budget
```

**Request Body:**
```json
{
  "category": "GENERAL",
  "description": "General operating expenses",
  "amount": 50000.00,
  "period": "2024-Q1",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "status": "ACTIVE"
}
```

### Update Spent Amount
```http
POST /api/budget/:id/update-spent
```

**Request Body:**
```json
{
  "amount": 25000.00
}
```

## Reports API

### Get Dashboard Statistics
```http
GET /api/reports/dashboard
```

**Query Parameters:**
- `period` (string): Period filter (current, 2024, 2023, all)

**Response:**
```json
{
  "overview": {
    "totalMembers": 500,
    "activeMembers": 450,
    "memberEngagementRate": "90.0%",
    "totalEvents": 120,
    "upcomingEvents": 8,
    "totalVolunteers": 150,
    "activeVolunteers": 120,
    "volunteerEngagementRate": "80.0%"
  },
  "financial": {
    "totalGiving": 100000.00,
    "totalExpenses": 75000.00,
    "totalBudget": 200000.00,
    "totalSpent": 150000.00,
    "budgetUtilizationRate": "75.0%",
    "pendingExpenses": 5
  },
  "operations": {
    "totalInventory": 200,
    "availableInventory": 180,
    "inventoryAvailabilityRate": "90.0%",
    "totalVendors": 50,
    "activeVendors": 45,
    "vendorActivationRate": "90.0%",
    "totalPastoralCare": 25,
    "openPastoralCare": 8
  }
}
```

### Get Member Reports
```http
GET /api/reports/members
```

**Query Parameters:**
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter

### Get Financial Reports
```http
GET /api/reports/financial
```

**Query Parameters:**
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter
- `category` (string): Category filter

### Get Attendance Reports
```http
GET /api/reports/attendance
```

**Query Parameters:**
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter
- `eventId` (string): Event filter

### Get Volunteer Reports
```http
GET /api/reports/volunteers
```

**Query Parameters:**
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter
- `ministry` (string): Ministry filter

### Get Inventory Reports
```http
GET /api/reports/inventory
```

**Query Parameters:**
- `category` (string): Category filter
- `status` (string): Status filter
- `condition` (string): Condition filter

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## Data Formats

All dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

All monetary values are in decimal format with 2 decimal places.

## Pagination

List endpoints support pagination with the following response structure:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Search and Filtering

Most list endpoints support:
- **Search**: Full-text search across relevant fields
- **Filtering**: Field-specific filtering
- **Sorting**: Sort by various fields
- **Pagination**: Navigate through large datasets

## Webhooks

The CDMS supports webhooks for real-time notifications:

### Configure Webhooks
```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["member.created", "event.created", "expense.approved"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events
- `member.created` - New member added
- `member.updated` - Member information updated
- `event.created` - New event created
- `event.updated` - Event details updated
- `expense.created` - New expense submitted
- `expense.approved` - Expense approved
- `expense.rejected` - Expense rejected
- `attendance.recorded` - Attendance recorded
- `volunteer.assigned` - Volunteer assigned
- `inventory.checked_out` - Item checked out
- `inventory.checked_in` - Item returned

## SDK and Libraries

### JavaScript/TypeScript
```bash
npm install cdms-sdk
```

```javascript
import { CDMSClient } from 'cdms-sdk';

const client = new CDMSClient({
  baseURL: 'http://localhost:5000/api',
  apiKey: 'your-api-key'
});

const members = await client.members.list();
```

### Python
```bash
pip install cdms-python
```

```python
from cdms import CDMSClient

client = CDMSClient(
    base_url='http://localhost:5000/api',
    api_key='your-api-key'
)

members = client.members.list()
```

## Support

For API support:
- **Documentation**: https://docs.church-management.com
- **Status Page**: https://status.church-management.com
- **Support Email**: api-support@church-management.com
- **GitHub Issues**: https://github.com/church-management/cdms/issues

## Changelog

### v1.0.0
- Initial release with all core modules
- RESTful API with comprehensive endpoints
- JWT authentication system
- Real-time dashboard statistics
- Advanced reporting capabilities

---

**Last Updated**: January 2024
**API Version**: 1.0.0
