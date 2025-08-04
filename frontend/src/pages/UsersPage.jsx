import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Table from '../components/Table/Table';
import Modal from '../components/Modal/Modal';
import InputField from '../components/InputField/InputField';
import Select from '../components/Select/Select';
import Loading from '../components/Loading/Loading';
import Alert from '../components/Alert/Alert';
import Toast from '../components/Toast/Toast';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  UserCheck, 
  UserX, 
  Users,
  Crown,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Settings
} from 'lucide-react';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    phone_number: '',
    role: 'cashier',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [confirmState, setConfirmState] = useState({ open: false, user: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, visible: true, duration });
  };

  const handleCloseToast = () => setToast(t => ({ ...t, visible: false }));

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      email: '',
      username: '',
      full_name: '',
      phone_number: '',
      role: 'cashier',
      password: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone_number: user.phone_number || '',
      role: user.role,
      password: '' // Don't prefill password for security
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (user.email === currentUser.email) {
      showToast('You cannot delete your own account', 'error');
      return;
    }
    setConfirmState({ open: true, user });
  };

  const handleConfirmDelete = async () => {
    const user = confirmState.user;
    setConfirmLoading(true);
    try {
      await authAPI.deleteUser(user.email);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast(`User "${user.full_name}" has been deleted successfully`, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      showToast(`Failed to delete user: ${errorMessage}`, 'error');
      console.error('Delete user error:', err);
    } finally {
      setConfirmLoading(false);
      setConfirmState({ open: false, user: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }

    if (modalMode === 'create' && !formData.password.trim()) {
      errors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const response = await authAPI.register(formData);
        await fetchUsers(); // Refresh the list
        showToast('User created successfully', 'success');
      } else {
        // For updates, we would need an update endpoint in the backend
        showToast('User update functionality needs backend endpoint', 'warning');
      }
      setShowModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      showToast(`Failed to ${modalMode} user: ${errorMessage}`, 'error');
      console.error(`${modalMode} user error:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200';
      case 'manager': return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200';
      case 'cashier': return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 mr-1" />;
      case 'manager': return <Shield className="w-3 h-3 mr-1" />;
      case 'cashier': return <User className="w-3 h-3 mr-1" />;
      default: return <User className="w-3 h-3 mr-1" />;
    }
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const managers = users.filter(u => u.role === 'manager').length;
    const cashiers = users.filter(u => u.role === 'cashier').length;

    return { total, active, admins, managers, cashiers };
  };

  const stats = getUserStats();

  const columns = [
    {
      key: 'user_info',
      header: 'User',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
            user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
            user.role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
            'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            {user.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.full_name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {user.email}
            </div>
            <div className="text-xs text-gray-400">@{user.username}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user) => (
        <div className="space-y-1">
          {user.phone_number && (
            <div className="text-sm text-gray-600 flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {user.phone_number}
            </div>
          )}
          {!user.phone_number && (
            <div className="text-xs text-gray-400">No phone</div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
          {getRoleIcon(user.role)}
          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (user) => (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
          user.is_active 
            ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200'
        }`}>
          {user.is_active ? (
            <>
              <UserCheck className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <UserX className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user) => (
        <div className="text-sm text-gray-600 flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(user)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 p-2 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(user)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 p-2 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {user.email !== currentUser.email && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(user)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 p-2 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (currentUser?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Alert
            type="error"
            title="Access Denied"
            message="You need admin privileges to access this page."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
          duration={toast.duration}
        />
      )}
      
      {/* Confirm Modal for Delete */}
      <ConfirmModal
        isOpen={confirmState.open}
        title="Delete User"
        message={`Are you sure you want to delete user: ${confirmState.user?.full_name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, user: null })}
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmLoading}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-blue-100 mt-1">Manage system users and their roles</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button 
                onClick={handleCreate} 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button 
                variant="outline" 
                className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold text-red-900">{stats.admins}</p>
              </div>
              <Crown className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Managers</p>
                <p className="text-2xl font-bold text-purple-900">{stats.managers}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Cashiers</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.cashiers}</p>
              </div>
              <User className="w-8 h-8 text-indigo-500" />
            </div>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Search and Filters */}
        <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <InputField
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputClassName="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={filterOptions}
                  className="min-w-32"
                />
              </div>
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="min-w-32"
              />
            </div>
          </div>
          
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
                {searchTerm && ` matching "${searchTerm}"`}
                {roleFilter !== 'all' && ` with role "${roleFilter}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
              </p>
            </div>
          )}
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden shadow-lg">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  User Directory ({filteredUsers.length})
                </h3>
              </div>
              <Table
                columns={columns}
                data={filteredUsers}
                className="min-w-full"
              />
            </>
          )}
        </Card>

        {/* User Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalMode === 'create' ? '🎯 Add New User' :
            modalMode === 'edit' ? '✏️ Edit User' :
            '👤 User Details'
          }
          size="md"
        >
          {modalMode === 'view' ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center font-bold text-white text-xl ${
                  selectedUser?.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  selectedUser?.role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  {selectedUser?.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{selectedUser?.full_name}</h3>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full mt-2 ${getRoleBadgeColor(selectedUser?.role)}`}>
                  {getRoleIcon(selectedUser?.role)}
                  {selectedUser?.role?.charAt(0).toUpperCase() + selectedUser?.role?.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedUser?.email}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    @{selectedUser?.username}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedUser?.phone_number || 'Not provided'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                    selectedUser?.is_active 
                      ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' 
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200'
                  }`}>
                    {selectedUser?.is_active ? <UserCheck className="w-4 h-4 mr-1" /> : <UserX className="w-4 h-4 mr-1" />}
                    {selectedUser?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  error={formErrors.full_name}
                  required
                  inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <InputField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  error={formErrors.username}
                  required
                  disabled={modalMode === 'edit'}
                  inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={formErrors.email}
                required
                disabled={modalMode === 'edit'}
                inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleFormChange}
                  placeholder="Optional"
                  inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <Select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  options={roleOptions}
                  error={formErrors.role}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <InputField
                label={modalMode === 'create' ? 'Password' : 'New Password (optional)'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                error={formErrors.password}
                required={modalMode === 'create'}
                placeholder={modalMode === 'edit' ? 'Leave blank to keep current password' : ''}
                inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
