# AccountingSystem - Technical Documentation (Phase 1)

## 📋 Project Overview

**AccountingSystem** is a modern, full-stack financial management application designed for small to medium-sized businesses. This Phase 1 implementation provides core accounting functionality with a focus on transaction management, billing, and user administration.

### 🎯 Core Objectives
- **Transaction Management**: Record and track income transactions
- **Billing System**: Generate, manage, and export invoices with PDF support
- **User Management**: Role-based access control (Admin, Manager, Cashier)
- **Dashboard Analytics**: Financial overview with interactive charts and statistics

---

## 🏗️ System Architecture

### Technology Stack

#### Backend
- **Framework**: Django 5.2.3 + Django REST Framework 3.16.0
- **Authentication**: JWT (SimpleJWT 5.5.0) with role-based access control
- **Database**: SQLite (development) - Production ready for PostgreSQL/MySQL
- **API Documentation**: Swagger/OpenAPI (drf-yasg 1.21.10)
- **CORS**: django-cors-headers 4.7.0

#### Frontend
- **Framework**: React 19.1.0 with Vite 7.0.0
- **Styling**: Tailwind CSS 4.1.11 with custom design system
- **Icons**: Lucide React 0.525.0
- **Charts**: Recharts 3.0.2
- **Forms**: React Hook Form 7.60.0
- **Routing**: React Router DOM 7.6.3
- **PDF Generation**: jsPDF 3.0.1 + html2canvas 1.4.1

### Project Structure
```
AccountingSystem/
├── backend/                    # Django backend application
│   ├── core/                   # Project configuration
│   │   ├── settings.py         # Django settings
│   │   ├── urls.py            # Main URL configuration
│   │   └── permissions.py      # Custom DRF permissions
│   ├── accounts/              # User management module
│   │   ├── models.py          # Custom User model
│   │   ├── views.py           # Authentication APIs
│   │   ├── serializers.py     # Data serialization
│   │   └── manager.py         # User manager
│   ├── transactions/          # Transaction management
│   │   ├── models.py          # Transaction model
│   │   ├── views.py           # Transaction CRUD APIs
│   │   └── serializer.py      # Transaction serializers
│   ├── billing/               # Billing and invoicing
│   │   ├── models.py          # Bill and BillItem models
│   │   ├── views.py           # Billing APIs
│   │   └── serializers.py     # Billing serializers
│   └── db.sqlite3            # SQLite database
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout/        # Application layout
│   │   │   ├── InputField/    # Form inputs
│   │   │   ├── Button/        # Action buttons
│   │   │   ├── Card/          # Container components
│   │   │   ├── Modal/         # Dialog components
│   │   │   ├── Table/         # Data tables
│   │   │   └── ...           # Other UI components
│   │   ├── pages/            # Page components
│   │   │   ├── DashboardPage.jsx    # Main dashboard
│   │   │   ├── TransactionsPage.jsx # Transaction management
│   │   │   ├── BillsPage.jsx        # Billing interface
│   │   │   ├── UsersPage.jsx        # User management
│   │   │   └── SettingsPage.jsx     # User settings
│   │   ├── contexts/         # React contexts
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   ├── api/              # API integration layer
│   │   │   ├── base.js       # Base API configuration
│   │   │   └── index.js      # API endpoints
│   │   ├── helpers/          # Utility functions
│   │   └── config/           # Configuration files
│   └── public/               # Static assets
│
└── docs/                     # Project documentation
    ├── API.md               # API reference
    └── ARCHITECTURE.md      # Architecture details
```

---

## 🗄️ Database Design

### Core Models

#### User Model (accounts.User)
```python
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)           # Primary login identifier
    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)  # admin, manager, cashier
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Transaction Model (transactions.Transaction)
```python
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET(get_deleted_user))
    received_from = models.CharField(max_length=100)   # Income source
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Bill Model (billing.Bill)
```python
class Bill(models.Model):
    bill_number = models.CharField(max_length=20, unique=True)
    billed_to = models.CharField(max_length=100)       # Customer name
    customer_address = models.TextField(blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    
    # Financial calculations
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    issued_by = models.ForeignKey(User, on_delete=models.SET(get_deleted_user))
    issued_at = models.DateTimeField(default=timezone.now)
```

#### BillItem Model (billing.BillItem)
```python
class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='bill_items')
    description = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
```

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow
1. **Login**: POST `/api/accounts/login/` with email/password
2. **Token Response**: Returns access token and user profile
3. **Token Storage**: Frontend stores token in localStorage
4. **Request Authorization**: Bearer token attached to all authenticated requests
5. **Token Validation**: Backend validates JWT on protected endpoints

### Role-Based Access Control

#### Permission Levels
- **Admin**: Full system access, user management, all CRUD operations
- **Manager**: Transaction and billing management, view user list (cashiers only)
- **Cashier**: Create/read transactions and bills, limited access

#### Custom Permissions (core/permissions.py)
```python
class IsManagerOrAbove(BasePermission):
    # Allows access to managers and admins
    
class CanCreateUsers(BasePermission):
    # Admin: can create all roles
    # Manager: can create cashiers only
    
class IsSuperUserOnly(BasePermission):
    # Restricts certain delete operations to superusers
```

---

## 🌐 API Endpoints

### Base Configuration
- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: application/json

### Authentication Endpoints (`/api/accounts/`)
```
POST   /login/                    # User authentication
GET    /profile/                  # Get user profile
PUT    /update-profile/           # Update user profile
POST   /change-password/          # Change password
GET    /user/                     # List users (role-based filtering)
POST   /register/                 # Create new user (admin/manager)
DELETE /delete-user/              # Delete user (superuser)
GET    /permissions/              # Get user permissions
```

### Transaction Endpoints (`/api/transactions/`)
```
GET    /                          # List all transactions
POST   /create/                   # Create new transaction
GET    /details/<id>/             # Get transaction details
PUT    /update/<id>/              # Update transaction
DELETE /delete/<id>/              # Delete transaction
GET    /summary/                  # Get transaction summary statistics
```

### Billing Endpoints (`/api/bills/`)
```
GET    /                          # List all bills
POST   /                          # Create new bill
GET    /<id>/                     # Get bill details
PUT    /<id>/update/              # Update bill
DELETE /<id>/delete/              # Delete bill
GET    /<id>/pdf/                 # Generate PDF (if implemented in backend)
```

### API Documentation
- **Swagger UI**: `http://localhost:8000/docs/` (development)
- **ReDoc**: `http://localhost:8000/redoc/` (development)

---

## 🎨 Frontend Architecture

### Component Structure

#### Layout Components
- **DashboardLayout**: Main application wrapper with sidebar navigation
- **Navigation**: Responsive sidebar with role-based menu filtering
- **Header**: Application header with user profile dropdown

#### Core UI Components
- **InputField**: Enhanced form input with validation and error display
- **Button**: Multi-variant button (primary, secondary, ghost, danger)
- **Card**: Flexible container with customizable padding, shadow, and rounded corners
- **Modal**: Accessible modal dialogs with backdrop and focus management
- **Table**: Data table with sorting, filtering, and action columns
- **Select**: Dropdown component with validation support
- **Loading**: Multiple loading states (spinner, skeleton, overlay)
- **Alert**: Notification messages with different types (success, error, warning, info)

#### Page Components
- **DashboardPage**: Overview with statistics cards and charts
- **TransactionsPage**: Transaction management with CRUD operations
- **BillsPage**: Billing interface with PDF generation
- **UsersPage**: User management (admin only)
- **SettingsPage**: User profile and password management

### State Management

#### Authentication Context (`AuthContext.jsx`)
```javascript
const AuthContext = {
  user: null,                    // Current user object
  isAuthenticated: false,        // Authentication status
  loading: true,                 // Loading state
  login: (credentials) => {},    // Login function
  logout: () => {},             // Logout function
  updateUser: (userData) => {}   // Update user profile
}
```

### API Integration

#### Base API Configuration (`api/base.js`)
- **Automatic token injection** from localStorage
- **Response/error handling** with detailed error parsing
- **Network error detection** and user-friendly messages
- **401 handling** with automatic token clearance

#### API Modules (`api/index.js`)
```javascript
export const authAPI = {
  login, register, getProfile, updateProfile, changePassword, getUsers, deleteUser
};

export const transactionAPI = {
  getTransactions, createTransaction, getTransactionDetail, 
  updateTransaction, deleteTransaction, getTransactionSummary
};

export const billingAPI = {
  getBills, createBill, getBillDetail, updateBill, deleteBill
};
```

---

## 📊 Features Implementation

### Dashboard Analytics
- **Statistics Cards**: Total transactions, revenue, bills, and bill value
- **Trend Charts**: 14-day transaction and billing trends using Recharts
- **Quick Actions**: Shortcut buttons for common operations
- **Role-based Widgets**: Different views based on user permissions

### Transaction Management
- **CRUD Operations**: Create, read, update, delete transactions
- **Real-time Search**: Filter by recipient name, amount, or date
- **Form Validation**: Client-side validation with error display
- **Modal Interface**: Add/edit transactions in modal dialogs
- **Currency Formatting**: Automatic currency display with proper formatting

### Billing System
- **Invoice Generation**: Create detailed bills with multiple line items
- **Automatic Calculations**: Subtotal, tax, discount, and total computations
- **PDF Export**: Generate and download PDF invoices
- **Payment Tracking**: Multiple payment method support
- **Customer Management**: Store customer information with bills

### User Management
- **Role-based Creation**: Admins create all roles, managers create cashiers
- **Profile Management**: Users can update their own profiles
- **Password Management**: Secure password change with validation
- **User Statistics**: Overview of system users by role and status

---

## 🔧 Development Setup

### Backend Setup
```bash
cd backend/
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend/
npm install
npm run dev
```

### Environment Configuration
- **Backend**: Configure `CORS_ALLOWED_ORIGINS` for production
- **Frontend**: Set `VITE_API_URL` environment variable
- **Database**: Replace SQLite with PostgreSQL for production

---

## 🧪 Testing & Quality Assurance

### Demo Accounts
```
Admin:    admin@example.com    / password123
Manager:  manager@example.com  / password123
Cashier:  cashier@example.com  / password123
```

### API Testing
- Use Swagger UI at `/docs/` for interactive API testing
- All endpoints include proper error handling and validation
- JWT authentication tested across all protected routes

### Frontend Testing
- Responsive design tested across device sizes
- Form validation and error handling verified
- Role-based access control validated
- Cross-browser compatibility ensured

---

## 🚀 Deployment Considerations

### Backend Deployment
- **Database**: Migrate from SQLite to PostgreSQL/MySQL
- **Security**: Update `SECRET_KEY`, restrict `ALLOWED_HOSTS`
- **Static Files**: Configure proper static file serving
- **Environment Variables**: Use environment-based configuration

### Frontend Deployment
- **Build Optimization**: `npm run build` for production bundle
- **Environment Variables**: Configure API URLs for different environments
- **CDN**: Consider CDN for static asset delivery
- **HTTPS**: Ensure secure connection for JWT token transmission

### Infrastructure Requirements
- **Backend**: Python 3.8+, Django 5.x, PostgreSQL 12+
- **Frontend**: Node.js 16+, Modern browser support
- **Server**: 2GB RAM minimum, SSD storage recommended

---

## 📈 Performance Metrics

### Frontend Performance
- **Bundle Size**: Optimized with Vite code splitting
- **Loading States**: Implemented across all async operations
- **Component Optimization**: Proper React memo and dependency arrays
- **API Caching**: Efficient data fetching with error boundaries

### Backend Performance
- **Database Queries**: Optimized with proper indexing
- **API Response Time**: < 200ms for standard operations
- **Pagination**: Ready for implementation on large datasets
- **Security**: JWT token validation with minimal overhead

---

## 🔮 Future Enhancements (Phase 2+)

### Planned Features
- **Expense Management**: Track outgoing transactions
- **Advanced Reporting**: P&L, Balance Sheet, Cash Flow reports
- **Multi-currency Support**: Handle different currencies
- **Inventory Management**: Product and service tracking
- **Mobile Application**: React Native mobile app
- **Email Integration**: Automated invoice delivery
- **Backup & Restore**: Automated data backup system

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Machine learning insights
- **API Rate Limiting**: Implement request throttling
- **Audit Logging**: Comprehensive user action tracking
- **Multi-tenancy**: Support for multiple organizations

---

This documentation represents the current state of the AccountingSystem Phase 1 implementation, providing a solid foundation for financial management with modern web technologies and best practices.
