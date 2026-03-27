# Church Data Management System (CDMS)

A comprehensive church management system built with modern web technologies to streamline church operations, member management, financial tracking, and administrative tasks.

## 🚀 Features

### Core Modules
- **👥 Member Management**: Complete member records with family tracking, spiritual milestones, and communication history
- **📅 Attendance Tracking**: Real-time attendance recording with event-based check-ins and analytics
- **💰 Financial Management**: Comprehensive financial tracking, budgeting, expense management, and reporting
- **🤝 Volunteer Coordination**: Volunteer assignment system with ministry coordination and scheduling
- **📊 Event Planning**: Complete event management with registration, scheduling, and attendance tracking
- **🙏 Pastoral Care**: Spiritual care tracking with follow-up management and case notes
- **📦 Inventory Management**: Ministry resource tracking with checkout system and condition monitoring
- **🏪 Vendor Management**: Supplier relationship management with service tracking and payment history
- **📈 Reporting & Analytics**: Comprehensive dashboard with real-time statistics and custom reports

### Key Features
- **🔐 Secure Authentication**: Role-based access control with JWT authentication
- **📱 Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **🔄 Real-time Updates**: Live data synchronization across all modules
- **📊 Visual Analytics**: Interactive charts and progress indicators
- **🔍 Advanced Search**: Full-text search with filtering across all data
- **📤 Data Export**: Export functionality for reports and data analysis
- **⚡ Performance Optimized**: Efficient database queries and caching

## 🛠 Technology Stack

### Backend
- **Node.js** with **Express.js** for RESTful API
- **TypeScript** for type safety and better development experience
- **Prisma ORM** for database management and type-safe queries
- **PostgreSQL** as the primary database
- **JWT** for secure authentication
- **bcrypt** for password hashing

### Frontend
- **React** with **TypeScript** for component-based UI
- **Tailwind CSS** for modern, responsive styling
- **Axios** for HTTP client communication
- **React Router** for navigation
- **React Hooks** for state management

### Development
- **Vite** for fast development and building
- **ESLint** and **Prettier** for code quality
- **Jest** for testing framework
- **Git** for version control

## 📋 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Church
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd server
   npm install
   
   # Frontend dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # In server directory
   cp .env.example .env
   
   # Edit .env with your database credentials
   DATABASE_URL="postgresql://username:password@localhost:5432/church_db"
   JWT_SECRET="your-secret-key"
   ```

4. **Set up the database**
   ```bash
   # In server directory
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend development server
   cd client
   npm run dev
   ```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## 📊 Database Schema

The system uses a comprehensive database schema with the following key entities:

### Core Entities
- **Users**: System administrators and staff
- **Members**: Church members with personal information and spiritual data
- **Families**: Family relationships and household management
- **Events**: Church events with scheduling and registration
- **Attendance**: Attendance records with check-in/check-out tracking
- **Financial Records**: Income, expenses, and contribution tracking
- **Volunteer Assignments**: Volunteer coordination and ministry assignments
- **Pastoral Care Records**: Spiritual care tracking and follow-ups
- **Inventory Items**: Ministry resources and equipment management
- **Vendors**: Supplier management and service tracking
- **Budgets**: Financial planning and expense allocation

### Relationships
- Members belong to families
- Members have attendance records
- Members can be volunteers
- Members have financial records
- Events have attendance and expenses
- Volunteer assignments link members to ministries
- Pastoral care records track member spiritual needs
- Inventory items can be checked out to users

## 🔐 Security Features

### Authentication
- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Session management with automatic expiration
- Role-based access control

### Data Protection
- Input validation and sanitization
- SQL injection prevention with Prisma ORM
- XSS protection with proper data escaping
- CORS configuration for API security

### Access Control
- Role-based permissions (Admin, Staff, Volunteer)
- Module-specific access restrictions
- Audit logging for sensitive operations

## 📱 User Interface

### Dashboard
- Real-time statistics and KPIs
- Quick access to common tasks
- Recent activity feed
- Performance indicators

### Module Navigation
- Clean, intuitive sidebar navigation
- Module-specific dashboards
- Consistent design patterns
- Mobile-responsive layout

### Data Management
- Advanced filtering and search
- Bulk operations for efficiency
- Data import/export capabilities
- Real-time validation

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Members
- `GET /api/members` - List members with pagination
- `POST /api/members` - Create new member
- `GET /api/members/:id` - Get member details
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in member
- `POST /api/attendance/checkout` - Check out member

### Financial
- `GET /api/financial` - Get financial records
- `POST /api/financial` - Add financial record
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add expense

### And more...

## 📈 Reporting

### Dashboard Statistics
- Member engagement metrics
- Financial overview
- Event attendance trends
- Volunteer participation rates

### Detailed Reports
- Member reports by status/ministry
- Financial reports by category/period
- Attendance reports by event/date
- Inventory utilization reports

### Export Options
- CSV export for data analysis
- PDF reports for printing
- Excel format for advanced analysis

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server
npm run build
```

### Environment Setup
- Configure production database
- Set environment variables
- Configure SSL certificates
- Set up reverse proxy (nginx/Apache)

### Deployment Options
- **Docker**: Containerized deployment
- **Cloud Services**: AWS, Google Cloud, Azure
- **VPS**: DigitalOcean, Linode, Vultr
- **Traditional**: Dedicated servers

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for user workflows

## 📝 Documentation

### API Documentation
- Comprehensive API documentation
- Request/response examples
- Authentication requirements
- Error handling guidelines

### User Documentation
- User manual for all features
- Video tutorials for common tasks
- FAQ section
- Best practices guide

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commit messages

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline documentation
- **Issues**: Report bugs via GitHub issues
- **Community**: Join our Discord/Slack community
- **Email**: support@church-management.com

### Common Issues
- Database connection problems
- Authentication issues
- Performance optimization
- Deployment challenges

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Church administrators and staff for requirements and feedback
- Development team for dedication and expertise
- Open source community for tools and libraries
- Church community for testing and support

---

## 🎯 Future Roadmap

### Phase 2 Features
- Mobile applications (iOS/Android)
- Advanced analytics and AI insights
- Integration with church management tools
- Automated reporting and alerts
- Multi-language support

### Phase 3 Features
- Cloud hosting and SaaS offering
- Advanced security features
- API marketplace for integrations
- Custom workflow automation
- Advanced user permissions

---

**Built with ❤️ for church communities worldwide**
4. **Event Planning** - Service scheduling, registrations, and resource management
5. **Communication System** - Targeted SMS/Email communications
6. **Volunteer Coordination** - Team management and scheduling
7. **Pastoral Care** - Prayer requests, counseling, and visitation tracking
8. **Inventory Management** - Asset tracking and maintenance
9. **Expense Accounting** - Operational expense tracking
10. **Vendor Management** - Service provider records and contracts
11. **Budget Planning** - Department budgeting and financial forecasting
12. **Reporting Dashboard** - Real-time analytics and custom reports
13. **Security System** - Role-based access control and data protection

## Technology Stack

### Frontend
- React.js 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Recharts for data visualization

### Backend
- Node.js with Express.js
- TypeScript for type safety
- Prisma ORM for database management
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

### Development Tools
- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- Concurrently for development workflow

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd church-data-management-system
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
church-data-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── prisma/           # Database schema and migrations
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript type definitions
│   └── package.json
└── package.json          # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create new member
- `GET /api/members/:id` - Get member details
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/stats` - Attendance statistics

### Financial
- `GET /api/financial` - Get financial records
- `POST /api/financial` - Add financial record
- `GET /api/financial/reports` - Financial reports

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event

## Database Schema

The application uses PostgreSQL with the following main entities:
- Users (system users with roles)
- Members (church members)
- Families (family relationships)
- Events (church services and activities)
- Attendance (attendance tracking)
- Financial Records (tithes, offerings, donations)
- Communications (emails, SMS, notifications)
- Volunteer Assignments
- Pastoral Care Records
- Inventory Items
- Expenses
- Vendors
- Budgets

## Security Features

- JWT-based authentication
- Role-based access control (Admin, Pastor, Staff, Volunteer, User)
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration
- Password hashing with bcrypt
- SQL injection prevention with Prisma ORM

## Development Scripts

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Database operations
cd server
npm run db:migrate    # Run database migrations
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed database with sample data
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics and AI insights
- [ ] Multi-language support
- [ ] Cloud deployment options
- [ ] Integration with church management tools
- [ ] Advanced reporting features
- [ ] Offline mode support
# cdms
