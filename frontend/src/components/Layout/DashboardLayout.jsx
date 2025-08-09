import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  User
} from 'lucide-react';
import Button from '../Button/Button';

const DashboardLayout = ({ children, currentPage = 'dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, key: 'dashboard' },
    { name: 'Transactions', href: '/transactions', icon: CreditCard, key: 'transactions' },
    { name: 'Bills', href: '/bills', icon: Receipt, key: 'bills' },
    { name: 'Users', href: '/users', icon: Users, key: 'users', adminOnly: true },
    { name: 'Settings', href: '/settings', icon: Settings, key: 'settings' },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (href) => {
    navigate(href);
    setSidebarOpen(false);
  };

  const isActive = (href) => location.pathname === href;

  const NavItem = ({ item }) => (
    <button
      onClick={() => handleNavigation(item.href)}
      className={`
        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left relative
        ${isActive(item.href)
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all ${isActive(item.href) ? 'bg-blue-600' : 'bg-transparent'}`} />
      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
      {item.name}
    </button>
  );

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent 
            navigation={filteredNavigation} 
            user={user} 
            onLogout={handleLogout}
            NavItem={NavItem}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent 
            navigation={filteredNavigation} 
            user={user} 
            onLogout={handleLogout}
            NavItem={NavItem}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, user, onLogout, NavItem }) => (
  <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
    {/* Logo */}
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="px-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-4 py-3 text-white shadow-sm">
          <div className="flex items-center">
            <DollarSign className="h-7 w-7" />
            <span className="ml-2 text-lg font-bold">AccountingSystem</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 px-3 space-y-1">
        {navigation.map((item) => (
          <NavItem key={item.key} item={item} />
        ))}
      </nav>
    </div>

    {/* User section */}
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center w-full">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="ml-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

export default DashboardLayout;
