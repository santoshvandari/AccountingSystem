# Accounting System Frontend

A modern, responsive React frontend for the Django-based Accounting System with beautiful UI and comprehensive features.

## 🚀 Features

### **Authentication System**
- **Secure Login** with JWT token authentication
- **Role-based access control** (Admin, Manager, Cashier)
- **Protected routes** with automatic redirects
- **Auto logout** on token expiration

### **Transaction Management**
- **CRUD operations** for financial transactions
- **Real-time search and filtering**
- **Form validation** with error handling
- **Responsive data tables**
- **Modal-based editing**

### **Billing System**
- **Invoice generation** and management
- **PDF download functionality**
- **Automatic bill number generation**
- **Customer management**
- **Bill tracking and history**

### **Dashboard**
- **Financial overview** with key metrics
- **Recent activity** summaries
- **Quick action buttons**
- **Interactive statistics cards**
- **Revenue tracking**

### **Modern UI Components**
- **Reusable component library**
- **Consistent design system**
- **Mobile-responsive layout**
- **Accessible interfaces**
- **Loading states and error handling**

## 🛠️ Tech Stack

- **React 19** with functional components and hooks
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management
- **Custom API layer** with error handling

## 📋 Prerequisites

- Node.js (v20.19.0 or higher)
- npm or yarn package manager
- Django backend running on port 8000

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
npm run preview
```

## 🎨 UI Components

### **Core Components**
- `InputField` - Enhanced input with validation
- `Button` - Multi-variant button component
- `Card` - Flexible container component
- `Modal` - Accessible modal dialogs
- `Table` - Data table with sorting/filtering
- `Select` - Dropdown selection component
- `Loading` - Multiple loading states
- `Alert` - Notification messages

### **Layout Components**
- `DashboardLayout` - Main application layout
- `Navigation` - Responsive sidebar navigation
- `Header` - Application header with user info

## 🔐 Authentication Flow

1. **Login Page** - Email/password authentication
2. **Token Storage** - Secure JWT token management
3. **Protected Routes** - Automatic route protection
4. **Auto Refresh** - Token validation on app load
5. **Logout** - Clean token removal

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Breakpoint optimization** for all screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Collapsible navigation** for small screens

## 🔌 API Integration

### **Base API Configuration**
```javascript
// Automatic token injection
// Error handling with user feedback
// Request/response interceptors
// Network error handling
```

### **Available API Modules**
- `authAPI` - Authentication endpoints
- `transactionAPI` - Transaction management
- `billingAPI` - Billing and invoicing

## 🎯 Demo Credentials

For testing purposes:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**Manager Account:**
- Email: `manager@example.com`
- Password: `password123`

**Cashier Account:**
- Email: `cashier@example.com`
- Password: `password123`

## 📄 Available Pages

| Route | Description | Access Level |
|-------|-------------|--------------|
| `/login` | Authentication page | Public |
| `/dashboard` | Main dashboard | All authenticated users |
| `/transactions` | Transaction management | All authenticated users |
| `/bills` | Billing and invoicing | All authenticated users |
| `/users` | User management | Admin only |
| `/settings` | Application settings | All authenticated users |

## 🔧 Development

### **Code Structure**
```
src/
├── components/          # Reusable UI components
│   ├── Button/
│   ├── InputField/
│   ├── Modal/
│   └── ...
├── pages/              # Page components
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── api/               # API layer
│   ├── base.js
│   └── index.js
├── helpers/           # Utility functions
└── App.jsx           # Main application
```

### **Styling Guidelines**
- Use Tailwind CSS utility classes
- Follow consistent spacing patterns
- Implement responsive design patterns
- Use semantic color schemes

### **Component Guidelines**
- Write functional components with hooks
- Implement proper prop validation
- Handle loading and error states
- Follow accessibility best practices

## 🚀 Deployment

### **Build Optimization**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

### **Environment Variables**
- `VITE_API_URL` - Backend API base URL

## 🤝 Contributing

1. Follow the established code structure
2. Use TypeScript-style prop documentation
3. Implement responsive design patterns
4. Add proper error handling
5. Write comprehensive component documentation

## 📊 Performance Features

- **Code splitting** with React.lazy
- **Optimized bundle size** with Vite
- **Efficient re-renders** with proper dependency arrays
- **Cached API responses** where appropriate
- **Optimized images** and assets

This frontend provides a complete, modern interface for the accounting system with enterprise-level features and beautiful, intuitive design.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
